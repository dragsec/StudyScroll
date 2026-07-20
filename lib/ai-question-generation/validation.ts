import {
  CandidateQuestionSetSchema,
  type CandidateQuestionSet,
} from "./schemas";
import { isSafeReferenceUrl } from "./url-policy";

export type LocalIssue = { code: string; message: string };
export type LocalIssueMap = Map<string, LocalIssue[]>;

function addIssue(issues: LocalIssueMap, id: string, issue: LocalIssue) {
  const current = issues.get(id) ?? [];
  current.push(issue);
  issues.set(id, current);
}

function normalizeForComparison(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function inspectQuestionSet(input: unknown): {
  parsed: CandidateQuestionSet | null;
  issues: LocalIssueMap;
} {
  const result = CandidateQuestionSetSchema.safeParse(input);
  const issues: LocalIssueMap = new Map();

  if (!result.success) {
    for (const issue of result.error.issues) {
      const questionIndex = typeof issue.path[1] === "number" ? issue.path[1] : null;
      const id = questionIndex === null ? "batch" : `q-${String(questionIndex + 1).padStart(2, "0")}`;
      addIssue(issues, id, { code: "schema", message: issue.message });
    }
    return { parsed: null, issues };
  }

  const data = result.data;
  const ids = new Set<string>();
  const prompts = new Set<string>();
  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  const susCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const question of data.questions) {
    if (ids.has(question.id)) addIssue(issues, question.id, { code: "duplicate_id", message: "Question ID is duplicated." });
    ids.add(question.id);

    const normalizedPrompt = normalizeForComparison(question.prompt);
    if (prompts.has(normalizedPrompt)) addIssue(issues, question.id, { code: "duplicate_prompt", message: "Question prompt is duplicated." });
    prompts.add(normalizedPrompt);
    difficultyCounts[question.difficulty] += 1;

    const answerIds = new Set(question.answers.map((answer) => answer.id));
    if (answerIds.size !== 3) addIssue(issues, question.id, { code: "answer_ids", message: "Answer IDs must be unique." });

    const answerTexts = question.answers.map((answer) => normalizeForComparison(answer.text));
    if (new Set(answerTexts).size !== 3) addIssue(issues, question.id, { code: "duplicate_answer", message: "Answer statements must be distinct." });

    const susCount = question.answers.filter((answer) => answer.verdict === "sus").length as 0 | 1 | 2 | 3;
    susCounts[susCount] += 1;

    if (!isSafeReferenceUrl(question.reference.url)) {
      addIssue(issues, question.id, { code: "unsafe_reference", message: "Reference must use a safe public HTTPS URL." });
    }

    if (/<\/?[a-z][\s\S]*>/iu.test(question.prompt) || question.answers.some((answer) => /<\/?[a-z][\s\S]*>/iu.test(answer.text))) {
      addIssue(issues, question.id, { code: "html", message: "Generated text must not contain HTML." });
    }

    for (const answer of question.answers) {
      if (answer.feedback.legit === answer.feedback.sus) {
        addIssue(issues, question.id, { code: "feedback", message: `Answer ${answer.id} needs distinct feedback for each vote.` });
      }
    }
  }

  const expectedDifficulties = { easy: 5, medium: 10, hard: 5 };
  for (const [difficulty, expected] of Object.entries(expectedDifficulties)) {
    if (difficultyCounts[difficulty as keyof typeof difficultyCounts] !== expected) {
      addIssue(issues, "batch", { code: "difficulty_mix", message: `Expected ${expected} ${difficulty} questions.` });
    }
  }

  for (const count of [0, 1, 2, 3] as const) {
    if (susCounts[count] < 2) {
      addIssue(issues, "batch", { code: "verdict_mix", message: `At least two questions must contain ${count} Sus answers.` });
    }
  }

  return { parsed: data, issues };
}
