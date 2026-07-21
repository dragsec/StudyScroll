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

export type Persona = Pick<Answer, "handle" | "role">;

export type Question = {
  id: string;
  author: Persona;
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  clue: string;
  source: string;
  answers: Answer[];
};

export type PublicAnswer = Pick<Answer, "id" | "handle" | "role" | "text">;

export type PublicQuestion = Omit<Question, "answers"> & {
  answers: PublicAnswer[];
};

export type AnswerGrade = {
  correct: boolean;
  verdict: Verdict;
  feedback: string;
};

export type QuestionGrade = {
  questionId: string;
  score: number;
  total: number;
  answers: Record<string, AnswerGrade>;
  learningState?: import("@/data/account-types").LearningState;
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

export function toPublicQuestion(question: Question): PublicQuestion {
  return {
    ...question,
    answers: question.answers.map(({ id, handle, role, text }) => ({
      id,
      handle,
      role,
      text,
    })),
  };
}
