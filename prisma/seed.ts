import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  Difficulty,
  PublishStatus,
  QuestionSetOrigin,
  ReviewStatus,
  Verdict,
} from "../lib/generated/prisma/enums";
import { PrismaClient } from "../lib/generated/prisma/client";
import { questionDatasetFiles } from "../data/question-dataset";

const connectionString =
  process.env.DIRECT_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("Set DATABASE_URL or DIRECT_DATABASE_URL before running npm run db:seed.");
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000,
  max: 5,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const difficulties = {
  easy: Difficulty.EASY,
  medium: Difficulty.MEDIUM,
  hard: Difficulty.HARD,
} as const;

const verdicts = {
  legit: Verdict.LEGIT,
  sus: Verdict.SUS,
} as const;

const reviewStatuses = {
  draft: ReviewStatus.DRAFT,
  approved: ReviewStatus.APPROVED,
  rejected: ReviewStatus.REJECTED,
} as const;

async function seed() {
  const importedQuestionKeys = questionDatasetFiles.flatMap((file) =>
    file.questions.map((question) => question.id),
  );

  await prisma.$transaction(
    async (tx) => {
      const questionSet = await tx.questionSet.upsert({
        where: { key: "curated-v1" },
        create: {
          key: "curated-v1",
          title: "StudyScroll curated question dataset v1",
          schemaVersion: "1.0",
          datasetVersion: "v1",
          origin: QuestionSetOrigin.CURATED,
          status: PublishStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        update: {
          title: "StudyScroll curated question dataset v1",
          schemaVersion: "1.0",
          datasetVersion: "v1",
          origin: QuestionSetOrigin.CURATED,
          status: PublishStatus.PUBLISHED,
        },
      });

      for (const file of questionDatasetFiles) {
        const topic = await tx.topic.upsert({
          where: { slug: file.topic.id },
          create: { slug: file.topic.id, name: file.topic.name, isActive: true },
          update: { name: file.topic.name, isActive: true },
        });

        for (const [questionPosition, sourceQuestion] of file.questions.entries()) {
          const question = await tx.question.upsert({
            where: { key: sourceQuestion.id },
            create: {
              key: sourceQuestion.id,
              questionSetId: questionSet.id,
              topicId: topic.id,
              difficulty: difficulties[sourceQuestion.difficulty],
              prompt: sourceQuestion.prompt,
              context: sourceQuestion.context,
              position: questionPosition,
              reviewStatus: reviewStatuses[sourceQuestion.review_status],
              isActive: true,
            },
            update: {
              questionSetId: questionSet.id,
              topicId: topic.id,
              difficulty: difficulties[sourceQuestion.difficulty],
              prompt: sourceQuestion.prompt,
              context: sourceQuestion.context,
              position: questionPosition,
              reviewStatus: reviewStatuses[sourceQuestion.review_status],
              isActive: true,
            },
          });

          await tx.questionReference.upsert({
            where: { questionId: question.id },
            create: {
              questionId: question.id,
              title: sourceQuestion.reference.title,
              url: sourceQuestion.reference.url,
            },
            update: {
              title: sourceQuestion.reference.title,
              url: sourceQuestion.reference.url,
            },
          });

          for (const [answerPosition, sourceAnswer] of sourceQuestion.answers.entries()) {
            await tx.answer.upsert({
              where: {
                questionId_key: { questionId: question.id, key: sourceAnswer.id },
              },
              create: {
                questionId: question.id,
                key: sourceAnswer.id,
                position: answerPosition,
                text: sourceAnswer.text,
                verdict: verdicts[sourceAnswer.verdict],
                feedbackLegit: sourceAnswer.feedback.legit,
                feedbackSus: sourceAnswer.feedback.sus,
              },
              update: {
                position: answerPosition,
                text: sourceAnswer.text,
                verdict: verdicts[sourceAnswer.verdict],
                feedbackLegit: sourceAnswer.feedback.legit,
                feedbackSus: sourceAnswer.feedback.sus,
              },
            });
          }

          await tx.answer.deleteMany({
            where: {
              questionId: question.id,
              key: { notIn: sourceQuestion.answers.map((answer) => answer.id) },
            },
          });
        }
      }

      await tx.question.deleteMany({
        where: {
          questionSetId: questionSet.id,
          key: { notIn: importedQuestionKeys },
        },
      });
    },
    // Hosted databases add network latency to every upsert. Keep the import
    // atomic, but allow enough time for the full curated dataset to finish.
    { maxWait: 10_000, timeout: 120_000 },
  );

  const [topicCount, questionCount, answerCount] = await Promise.all([
    prisma.topic.count({ where: { isActive: true } }),
    prisma.question.count({
      where: { questionSet: { key: "curated-v1" }, isActive: true },
    }),
    prisma.answer.count({
      where: { question: { questionSet: { key: "curated-v1" }, isActive: true } },
    }),
  ]);

  if (topicCount !== 14 || questionCount !== 168 || answerCount !== 504) {
    throw new Error(
      `Seed verification failed: ${topicCount} topics, ${questionCount} questions, ${answerCount} answers.`,
    );
  }

  console.log(`Seeded ${topicCount} topics, ${questionCount} questions, and ${answerCount} answers.`);
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
  await pool.end();
}
