import "server-only";
import {
  Difficulty as DbDifficulty,
  PublishStatus,
  ReviewStatus,
  Verdict as DbVerdict,
} from "@/lib/generated/prisma/enums";
import { databaseUrl, getPrisma } from "@/lib/db/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { safePublicHttpsUrl } from "@/lib/security/url";
import {
  interleaveQuestionTopics,
  personaFor,
  questions as localQuestions,
} from "@/data/questions";
import {
  type Difficulty,
  type Question,
  type Topic,
  type Verdict,
} from "@/data/question-types";

export type QuestionDataSource = "mock" | "postgres";
type ConfiguredQuestionDataSource = QuestionDataSource | "auto";

export type QuestionFeedResult = {
  questions: Question[];
  source: QuestionDataSource;
  datasetVersion: string;
};

const questionInclude = {
  topic: true,
  questionSet: { select: { datasetVersion: true } },
  reference: true,
  answers: { orderBy: { position: "asc" as const } },
} satisfies Prisma.QuestionInclude;

function configuredDataSource(): ConfiguredQuestionDataSource {
  const value = process.env.QUESTION_DATA_SOURCE?.trim().toLowerCase() || "auto";
  if (value === "mock" || value === "postgres" || value === "auto") return value;
  throw new Error("QUESTION_DATA_SOURCE must be mock, postgres, or auto.");
}

export function resolvedDataSource(): QuestionDataSource {
  const configured = configuredDataSource();
  if (configured === "mock") return "mock";
  if (configured === "postgres") return "postgres";
  return databaseUrl() ? "postgres" : "mock";
}

function toDifficulty(value: DbDifficulty): Difficulty {
  return value.toLowerCase() as Difficulty;
}

function toVerdict(value: DbVerdict): Verdict {
  return value.toLowerCase() as Verdict;
}

function mapQuestionRow(
  row: Prisma.QuestionGetPayload<{ include: typeof questionInclude }>,
): Question {
  return {
    id: row.key,
    topic: row.topic.name as Topic,
    difficulty: toDifficulty(row.difficulty),
    prompt: row.prompt,
    clue: row.context ?? row.reference?.title ?? "StudyScroll reviewed source",
    source: safePublicHttpsUrl(row.reference?.url ?? "") ?? "",
    answers: row.answers.map((answer, answerIndex) => {
      const [handle, role] = personaFor(row.key, answerIndex);
      return {
        id: answer.key,
        handle,
        role,
        text: answer.text,
        verdict: toVerdict(answer.verdict),
        feedback: {
          legit: answer.feedbackLegit,
          sus: answer.feedbackSus,
        },
      };
    }),
  };
}

async function readPublishedQuestions(): Promise<QuestionFeedResult> {
  const rows = await getPrisma().question.findMany({
    where: {
      isActive: true,
      reviewStatus: ReviewStatus.APPROVED,
      topic: { isActive: true },
      questionSet: { status: PublishStatus.PUBLISHED },
    },
    include: questionInclude,
    orderBy: [{ topic: { name: "asc" } }, { position: "asc" }],
  });

  const mapped = rows.map(mapQuestionRow);

  const datasetVersion = rows[0]?.questionSet.datasetVersion ?? "database";
  return {
    questions: interleaveQuestionTopics(mapped),
    source: "postgres",
    datasetVersion,
  };
}

export async function getQuestionFeed(): Promise<QuestionFeedResult> {
  if (resolvedDataSource() === "mock") {
    return { questions: localQuestions, source: "mock", datasetVersion: "v1" };
  }
  return readPublishedQuestions();
}

export async function getQuestionForGrading(questionId: string): Promise<Question | null> {
  if (resolvedDataSource() === "mock") {
    return localQuestions.find((question) => question.id === questionId) ?? null;
  }

  const row = await getPrisma().question.findFirst({
    where: {
      key: questionId,
      isActive: true,
      reviewStatus: ReviewStatus.APPROVED,
      topic: { isActive: true },
      questionSet: { status: PublishStatus.PUBLISHED },
    },
    include: questionInclude,
  });
  return row ? mapQuestionRow(row) : null;
}

export async function checkQuestionStore() {
  const source = resolvedDataSource();
  if (source === "mock") return { source, reachable: true } as const;
  await getPrisma().$queryRaw`SELECT 1`;
  return { source, reachable: true } as const;
}
