import "server-only";

import type { Prisma } from "@/lib/generated/prisma/client";
import type { LearningState } from "@/data/account-types";
import { emptyLearningState } from "@/data/account-types";
import type { Question, Verdict } from "@/data/question-types";
import { getPrisma } from "@/lib/db/prisma";
import {
  dateKeyForTimeZone,
  nextQuestionReview,
  normalizeTimeZone,
} from "@/lib/learning/schedule";

export async function ensureLearnerProfile(userId: string, timeZone?: string) {
  return getPrisma().learnerProfile.upsert({
    where: { userId },
    create: { userId, timezone: normalizeTimeZone(timeZone) },
    update: timeZone ? { timezone: normalizeTimeZone(timeZone) } : {},
  });
}

export async function readLearningState(userId: string): Promise<LearningState> {
  const prisma = getPrisma();
  await ensureLearnerProfile(userId);

  const [saved, questionStates, subjects, days, judgments] = await Promise.all([
    prisma.userSavedQuestion.findMany({
      where: { userId },
      select: { questionKey: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.userQuestionState.findMany({
      where: { userId, totalAttempts: { gt: 0 } },
      select: { questionKey: true, everPerfect: true },
    }),
    prisma.userSubjectProgress.findMany({
      where: { userId },
      select: { topic: true, perfectQuestions: true },
    }),
    prisma.userDailyProgress.findMany({
      where: { userId },
      select: { dateKey: true, perfectCount: true },
      orderBy: { dateKey: "asc" },
      take: 400,
    }),
    prisma.questionAttempt.aggregate({
      where: { userId },
      _sum: { score: true },
    }),
  ]);

  return {
    savedQuestionIds: saved.map((item) => item.questionKey),
    attemptedQuestionIds: questionStates.map((item) => item.questionKey),
    perfectQuestionIds: questionStates
      .filter((item) => item.everPerfect)
      .map((item) => item.questionKey),
    correctJudgments: judgments._sum.score ?? 0,
    perfectByTopic: Object.fromEntries(
      subjects.map((item) => [item.topic, item.perfectQuestions]),
    ),
    dailyPerfect: Object.fromEntries(days.map((item) => [item.dateKey, item.perfectCount])),
  };
}

export async function setSavedQuestion(userId: string, questionKey: string, saved: boolean) {
  const prisma = getPrisma();
  await ensureLearnerProfile(userId);

  if (saved) {
    await prisma.userSavedQuestion.upsert({
      where: { userId_questionKey: { userId, questionKey } },
      create: { userId, questionKey },
      update: {},
    });
  } else {
    await prisma.userSavedQuestion.deleteMany({ where: { userId, questionKey } });
  }
}

export async function recordQuestionAttempt(input: {
  userId: string;
  question: Question;
  decisions: Record<string, Verdict>;
  score: number;
  total: number;
  timeZone: string;
}) {
  const prisma = getPrisma();
  const now = new Date();
  const timeZone = normalizeTimeZone(input.timeZone);

  await prisma.$transaction(async (tx) => {
    await tx.learnerProfile.upsert({
      where: { userId: input.userId },
      create: { userId: input.userId, timezone: timeZone },
      update: { timezone: timeZone },
    });

    const existing = await tx.userQuestionState.findUnique({
      where: {
        userId_questionKey: {
          userId: input.userId,
          questionKey: input.question.id,
        },
      },
      select: { reviewStage: true },
    });
    const review = nextQuestionReview(input.score, input.total, existing?.reviewStage ?? 0, now);

    await tx.questionAttempt.create({
      data: {
        userId: input.userId,
        questionKey: input.question.id,
        topic: input.question.topic,
        decisions: input.decisions as Prisma.InputJsonValue,
        score: input.score,
        total: input.total,
        isPerfect: input.score === input.total,
      },
    });

    await tx.userQuestionState.upsert({
      where: {
        userId_questionKey: {
          userId: input.userId,
          questionKey: input.question.id,
        },
      },
      create: {
        userId: input.userId,
        questionKey: input.question.id,
        topic: input.question.topic,
        totalAttempts: 1,
        lastScore: input.score,
        reviewStage: review.stage,
        everPerfect: false,
        firstAttemptedAt: now,
        lastAttemptedAt: now,
        nextReviewAt: review.at,
      },
      update: {
        topic: input.question.topic,
        totalAttempts: { increment: 1 },
        lastScore: input.score,
        reviewStage: review.stage,
        lastAttemptedAt: now,
        nextReviewAt: review.at,
      },
    });

    if (input.score === input.total) {
      const promoted = await tx.userQuestionState.updateMany({
        where: {
          userId: input.userId,
          questionKey: input.question.id,
          everPerfect: false,
        },
        data: { everPerfect: true },
      });

      if (promoted.count === 1) {
        const dateKey = dateKeyForTimeZone(timeZone, now);
        await Promise.all([
          tx.userDailyProgress.upsert({
            where: { userId_dateKey: { userId: input.userId, dateKey } },
            create: { userId: input.userId, dateKey, perfectCount: 1 },
            update: { perfectCount: { increment: 1 } },
          }),
          tx.userSubjectProgress.upsert({
            where: {
              userId_topic: { userId: input.userId, topic: input.question.topic },
            },
            create: {
              userId: input.userId,
              topic: input.question.topic,
              perfectQuestions: 1,
            },
            update: { perfectQuestions: { increment: 1 } },
          }),
        ]);
      }
    }
  });

  return readLearningState(input.userId);
}

export async function personalizeQuestionOrder(userId: string, questions: Question[]) {
  if (questions.length === 0) return questions;
  const states = await getPrisma().userQuestionState.findMany({
    where: {
      userId,
      questionKey: { in: questions.map((question) => question.id) },
    },
    select: {
      questionKey: true,
      everPerfect: true,
      nextReviewAt: true,
    },
  });

  const byQuestion = new Map(states.map((state) => [state.questionKey, state]));
  const now = Date.now();
  return questions
    .map((question, index) => {
      const state = byQuestion.get(question.id);
      const due = state?.nextReviewAt && state.nextReviewAt.getTime() <= now;
      const bucket = !state ? 2 : due && !state.everPerfect ? 0 : due ? 1 : 3;
      return { question, index, bucket, dueAt: state?.nextReviewAt?.getTime() ?? 0 };
    })
    .sort((left, right) => {
      if (left.bucket !== right.bucket) return left.bucket - right.bucket;
      if (left.bucket <= 1 && left.dueAt !== right.dueAt) return left.dueAt - right.dueAt;
      return left.index - right.index;
    })
    .map((item) => item.question);
}

export async function deleteLearnerData(userId: string) {
  await getPrisma().learnerProfile.deleteMany({ where: { userId } });
}

export function fallbackLearningState(): LearningState {
  return { ...emptyLearningState };
}
