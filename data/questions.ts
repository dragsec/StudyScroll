import aws from "@/datasets/questions/v1/aws.json";
import calculus from "@/datasets/questions/v1/calculus.json";
import discreteMaths from "@/datasets/questions/v1/discrete-maths.json";
import docker from "@/datasets/questions/v1/docker.json";
import dsa from "@/datasets/questions/v1/dsa.json";
import java from "@/datasets/questions/v1/java.json";
import javascript from "@/datasets/questions/v1/javascript.json";
import linux from "@/datasets/questions/v1/linux.json";
import networking from "@/datasets/questions/v1/networking.json";
import operatingSystems from "@/datasets/questions/v1/operating-systems.json";
import python from "@/datasets/questions/v1/python.json";
import springBoot from "@/datasets/questions/v1/spring-boot.json";
import sql from "@/datasets/questions/v1/sql.json";
import systemDesign from "@/datasets/questions/v1/system-design.json";

export type Difficulty = "easy" | "medium" | "hard";
export type Verdict = "legit" | "sus";

export type Answer = {
  id: string;
  handle: string;
  role: string;
  text: string;
  verdict: Verdict;
  feedback: Record<Verdict, string>;
};

export type Question = {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  clue: string;
  source: string;
  answers: Answer[];
};

export const topics = [
  "All",
  "AWS",
  "Calculus",
  "Discrete Maths",
  "Docker",
  "DSA",
  "Java",
  "JavaScript",
  "Linux",
  "Networking",
  "Operating Systems",
  "Python",
  "Spring Boot",
  "SQL",
  "System Design",
] as const;

export type Topic = Exclude<(typeof topics)[number], "All">;

type DatasetTopicFile = {
  topic: { name: Topic };
  questions: Array<{
    id: string;
    difficulty: Difficulty;
    prompt: string;
    context?: string;
    answers: Array<{
      id: "a" | "b" | "c";
      text: string;
      verdict: Verdict;
      feedback: Record<Verdict, string>;
    }>;
    reference: { title: string; url: string };
  }>;
};

const dataset = [
  aws,
  calculus,
  discreteMaths,
  docker,
  dsa,
  java,
  javascript,
  linux,
  networking,
  operatingSystems,
  python,
  springBoot,
  sql,
  systemDesign,
] as unknown as DatasetTopicFile[];

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

function personaFor(questionId: string, answerIndex: number) {
  return personas[(stableHash(questionId) + answerIndex * 7) % personas.length];
}

const mappedQuestions: Question[] = dataset.flatMap((file) =>
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

const topicBuckets = topics
  .filter((topic): topic is Topic => topic !== "All")
  .map((topic) =>
    mappedQuestions
      .filter((question) => question.topic === topic)
      .sort((left, right) => {
        const hashDifference = stableHash(left.id) - stableHash(right.id);
        return hashDifference || left.id.localeCompare(right.id);
      }),
  )
  .sort((left, right) => stableHash(left[0].topic) - stableHash(right[0].topic));

export const questions = Array.from(
  { length: Math.max(...topicBuckets.map((bucket) => bucket.length)) },
  (_, questionIndex) => topicBuckets.map((bucket) => bucket[questionIndex]).filter(Boolean),
).flat();
