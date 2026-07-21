import { questionDatasetFiles } from "@/data/question-dataset";
import {
  topics,
  type Question,
  type Topic,
} from "@/data/question-types";

const personas = [
  ["@RinaK", "Software Engineer"],
  ["@violetAfterRain", "Data Engineer"],
  ["@PacketNico", "Network Engineer"],
  ["@ivoryTerminal", "Platform Engineer"],
  ["@marco.wav", "CS Student"],
  ["@andrea92", "Backend Developer"],
  ["@CirrusJane", "Cloud Architect"],
  ["@DrMinaLee", "Programming Tutor"],
  ["@kernel_kate", "Systems Engineer"],
  ["@uptime99", "Site Reliability Engineer"],
  ["@noetherFan", "Math Student"],
  ["@sasha_oncall", "DevOps Engineer"],
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
    author: (() => {
      const [handle, role] = personaFor(question.id, 3);
      return { handle, role };
    })(),
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
