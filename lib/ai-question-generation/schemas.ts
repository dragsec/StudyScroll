import { z } from "zod";

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);
export const VerdictSchema = z.enum(["legit", "sus"]);

export const AnswerFeedbackSchema = z.object({
  legit: z.string().min(12).max(500),
  sus: z.string().min(12).max(500),
}).strict();

export const GeneratedAnswerSchema = z.object({
  id: z.enum(["a", "b", "c"]),
  text: z.string().min(8).max(420),
  verdict: VerdictSchema,
  feedback: AnswerFeedbackSchema,
}).strict();

export const QuestionReferenceSchema = z.object({
  title: z.string().min(3).max(160),
  url: z.string().url().max(500),
}).strict();

export const CandidateQuestionSchema = z.object({
  id: z.string().regex(/^q-(0[1-9]|1[0-9]|20)$/),
  difficulty: DifficultySchema,
  prompt: z.string().min(15).max(240),
  answers: z.array(GeneratedAnswerSchema).length(3),
  reference: QuestionReferenceSchema,
}).strict();

export const CandidateQuestionSetSchema = z.object({
  topic: z.string().min(2).max(80),
  questions: z.array(CandidateQuestionSchema).length(20),
}).strict();

export const PromptDecisionSchema = z.object({
  accepted: z.boolean(),
  normalized_topic: z.string().max(80),
  reason_code: z.enum([
    "accepted",
    "not_a_topic",
    "too_broad",
    "unsafe",
    "not_educational",
    "instruction_injection",
  ]),
  user_message: z.string().min(1).max(180),
}).strict();

export const ReviewIssueSchema = z.object({
  code: z.enum([
    "factual_error",
    "verdict_error",
    "feedback_error",
    "weak_source",
    "duplicate",
    "unclear",
    "off_topic",
    "unsafe",
    "tone",
  ]),
  message: z.string().min(4).max(300),
}).strict();

export const QuestionReviewSchema = z.object({
  id: z.string().regex(/^q-(0[1-9]|1[0-9]|20)$/),
  approved: z.boolean(),
  issues: z.array(ReviewIssueSchema).max(8),
}).strict();

export const QuestionSetReviewSchema = z.object({
  reviews: z.array(QuestionReviewSchema).length(20),
}).strict();

export const RepairSetSchema = z.object({
  questions: z.array(CandidateQuestionSchema).min(1).max(20),
}).strict();

export const AiGenerationRequestSchema = z.object({
  topic: z.string(),
}).strict();

export type CandidateQuestion = z.infer<typeof CandidateQuestionSchema>;
export type CandidateQuestionSet = z.infer<typeof CandidateQuestionSetSchema>;
export type QuestionSetReview = z.infer<typeof QuestionSetReviewSchema>;

export type ApprovedQuestionSet = {
  schema_version: "1.0";
  dataset_version: "ai-v1";
  topic: { id: string; name: string };
  questions: Array<CandidateQuestion & { review_status: "approved" }>;
};
