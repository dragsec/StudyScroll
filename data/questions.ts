import { questionDatasetFiles } from "@/data/question-dataset";
import {
  topics,
  type Question,
  type Topic,
} from "@/data/question-types";

const personas = [
  ["@bytewise", "Software Engineer"],
  ["@querycraft", "Data Engineer"],
  ["@packettrail", "Network Engineer"],
  ["@runtime_notes", "Platform Engineer"],
  ["@proofbycoffee", "CS Student"],
  ["@stacktrace_sam", "Backend Developer"],
  ["@cloudmargin", "Cloud Architect"],
  ["@syntaxgarden", "Programming Tutor"],
  ["@kernelcorner", "Systems Engineer"],
  ["@latency_lens", "Site Reliability Engineer"],
  ["@mathonpaper", "Math Student"],
  ["@buildrepeat", "DevOps Engineer"],
] as const;

function stableHash(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function personaFor(questionId: string, answerIndex: number) {
  return personas[(stableHash(questionId) + answerIndex * 7) % personas.length];
}

const mappedQuestions: Question[] = questionDatasetFiles.flatMap((file) =>
  file.questions.map((question) => ({
    id: question.id,
    topic: file.topic.name,
    difficulty: question.difficulty,
    prompt: question.prompt,
    clue: question.context ?? question.reference.title,
    source: question.reference.url,
    answers: question.answers.map((answer, answerIndex) => {
      const [handle, role] = personaFor(question.id, answerIndex);
      return {
        ...answer,
        handle,
        role,
      };
    }),
  })),
);

export function interleaveQuestionTopics<
  T extends Pick<Question, "id" | "topic">,
>(questionBank: T[]): T[] {
  const topicBuckets = topics
  .filter((topic): topic is Topic => topic !== "All")
  .map((topic) =>
    questionBank
      .filter((question) => question.topic === topic)
      .sort((left, right) => {
        const hashDifference = stableHash(left.id) - stableHash(right.id);
        return hashDifference || left.id.localeCompare(right.id);
      }),
  )
  .filter((bucket) => bucket.length > 0)
  .sort((left, right) => stableHash(left[0].topic) - stableHash(right[0].topic));

  if (topicBuckets.length === 0) return [];

  return Array.from(
    { length: Math.max(...topicBuckets.map((bucket) => bucket.length)) },
    (_, questionIndex) => topicBuckets.map((bucket) => bucket[questionIndex]).filter(Boolean),
  ).flat();
}

export const questions = interleaveQuestionTopics(mappedQuestions);
