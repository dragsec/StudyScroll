import "server-only";

import { zodTextFormat } from "openai/helpers/zod";
import { aiGenerationConfig } from "./config";
import { AiGenerationError } from "./errors";
import { getOpenAIClient } from "./openai-client";
import {
  GENERATOR_SYSTEM_PROMPT,
  REPAIR_SYSTEM_PROMPT,
  REVIEWER_SYSTEM_PROMPT,
  TOPIC_GATE_SYSTEM_PROMPT,
} from "./prompts";
import {
  CandidateQuestionSetSchema,
  PromptDecisionSchema,
  QuestionSetReviewSchema,
  RepairSetSchema,
  type ApprovedQuestionSet,
  type CandidateQuestionSet,
  type QuestionSetReview,
} from "./schemas";
import { createSafetyIdentifier } from "./safety-identifier";
import { validateTopicLocally } from "./prompt-policy";
import { inspectQuestionSet, type LocalIssueMap } from "./validation";

type GenerateQuestionSetInput = {
  rawTopic: string;
  requestId: string;
  userId: string;
};

/**
 * Proof-of-concept orchestration for a trusted server worker.
 * Production requests should enqueue a durable job instead of waiting for this
 * multi-stage workflow inside a normal serverless request.
 */

function requireParsed<T>(value: T | null | undefined, stage: string): T {
  if (!value) {
    throw new AiGenerationError(
      "provider_failure",
      `The AI ${stage} did not return usable structured output.`,
      502,
    );
  }
  return value;
}

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 48);
  return slug || "custom-topic";
}

async function moderateTopic(topic: string) {
  const openai = getOpenAIClient();
  const result = await openai.moderations.create({
    model: aiGenerationConfig.moderationModel,
    input: topic,
  });

  if (result.results[0]?.flagged) {
    throw new AiGenerationError(
      "unsafe_topic",
      "That topic cannot be used to generate a StudyScroll set.",
      400,
    );
  }
}

async function gateTopic(topic: string, safetyIdentifier: string) {
  const openai = getOpenAIClient();
  const response = await openai.responses.parse({
    model: aiGenerationConfig.gateModel,
    store: false,
    safety_identifier: safetyIdentifier,
    max_output_tokens: 600,
    input: [
      { role: "system", content: TOPIC_GATE_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ topic }) },
    ],
    text: { format: zodTextFormat(PromptDecisionSchema, "topic_decision") },
  });

  const decision = requireParsed(response.output_parsed, "topic gate");
  if (!decision.accepted) {
    const code = decision.reason_code === "unsafe" ? "unsafe_topic" : "off_topic";
    throw new AiGenerationError(code, decision.user_message, 400);
  }
  return validateTopicLocally(decision.normalized_topic || topic);
}

async function generateInitialSet(topic: string, safetyIdentifier: string) {
  const openai = getOpenAIClient();
  const response = await openai.responses.parse({
    model: aiGenerationConfig.generationModel,
    store: false,
    safety_identifier: safetyIdentifier,
    reasoning: { effort: "medium" },
    max_output_tokens: 30_000,
    tools: [{ type: "web_search" }],
    input: [
      { role: "system", content: GENERATOR_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ topic }) },
    ],
    text: { format: zodTextFormat(CandidateQuestionSetSchema, "question_set") },
  });

  return requireParsed(response.output_parsed, "generator");
}

async function reviewSet(
  topic: string,
  questionSet: CandidateQuestionSet,
  safetyIdentifier: string,
) {
  const openai = getOpenAIClient();
  const response = await openai.responses.parse({
    model: aiGenerationConfig.reviewerModel,
    store: false,
    safety_identifier: safetyIdentifier,
    reasoning: { effort: "high" },
    max_output_tokens: 12_000,
    tools: [{ type: "web_search" }],
    input: [
      { role: "system", content: REVIEWER_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ topic, question_set: questionSet }) },
    ],
    text: { format: zodTextFormat(QuestionSetReviewSchema, "question_set_review") },
  });

  return requireParsed(response.output_parsed, "reviewer");
}

function rejectedQuestions(
  questionSet: CandidateQuestionSet,
  localIssues: LocalIssueMap,
  review: QuestionSetReview,
) {
  const issues = new Map<string, string[]>();

  for (const [id, local] of localIssues) {
    if (id === "batch") {
      for (const question of questionSet.questions) {
        issues.set(question.id, [...(issues.get(question.id) ?? []), ...local.map((issue) => issue.message)]);
      }
      continue;
    }
    issues.set(id, [...(issues.get(id) ?? []), ...local.map((issue) => issue.message)]);
  }

  const seenReviewIds = new Set<string>();
  for (const item of review.reviews) {
    if (seenReviewIds.has(item.id)) {
      issues.set(item.id, [...(issues.get(item.id) ?? []), "Reviewer returned this ID more than once."]);
    }
    seenReviewIds.add(item.id);
    if (!item.approved || item.issues.length > 0) {
      issues.set(item.id, [
        ...(issues.get(item.id) ?? []),
        ...item.issues.map((issue) => `${issue.code}: ${issue.message}`),
      ]);
    }
  }

  for (const question of questionSet.questions) {
    if (!seenReviewIds.has(question.id)) {
      issues.set(question.id, [...(issues.get(question.id) ?? []), "Reviewer omitted this question."]);
    }
  }

  return issues;
}

async function repairRejected(
  topic: string,
  questionSet: CandidateQuestionSet,
  issues: Map<string, string[]>,
  safetyIdentifier: string,
) {
  const openai = getOpenAIClient();
  const rejected = questionSet.questions
    .filter((question) => issues.has(question.id))
    .map((question) => ({ question, issues: issues.get(question.id) }));

  const response = await openai.responses.parse({
    model: aiGenerationConfig.generationModel,
    store: false,
    safety_identifier: safetyIdentifier,
    reasoning: { effort: "high" },
    max_output_tokens: 20_000,
    tools: [{ type: "web_search" }],
    input: [
      { role: "system", content: REPAIR_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ topic, rejected_questions: rejected }) },
    ],
    text: { format: zodTextFormat(RepairSetSchema, "repaired_questions") },
  });

  const repaired = requireParsed(response.output_parsed, "repair stage");
  const expectedIds = new Set(rejected.map((item) => item.question.id));
  const returnedIds = new Set(repaired.questions.map((question) => question.id));
  if (
    repaired.questions.length !== expectedIds.size ||
    [...returnedIds].some((id) => !expectedIds.has(id)) ||
    [...expectedIds].some((id) => !returnedIds.has(id))
  ) {
    throw new AiGenerationError(
      "quality_failed",
      "The AI repair stage returned the wrong question IDs.",
      502,
    );
  }

  const replacements = new Map(repaired.questions.map((question) => [question.id, question]));
  return {
    ...questionSet,
    questions: questionSet.questions.map((question) => replacements.get(question.id) ?? question),
  };
}

export async function generateQuestionSet({
  rawTopic,
  requestId,
  userId,
}: GenerateQuestionSetInput): Promise<ApprovedQuestionSet> {
  const localTopic = validateTopicLocally(rawTopic);
  const safetyIdentifier = createSafetyIdentifier(userId);

  await moderateTopic(localTopic);
  const topic = await gateTopic(localTopic, safetyIdentifier);
  let questionSet = await generateInitialSet(topic, safetyIdentifier);

  for (let round = 0; round <= aiGenerationConfig.maxRepairRounds; round += 1) {
    const local = inspectQuestionSet(questionSet);
    if (!local.parsed) {
      throw new AiGenerationError(
        "quality_failed",
        "The generated question set failed its schema contract.",
        502,
      );
    }
    questionSet = local.parsed;

    const review = await reviewSet(topic, questionSet, safetyIdentifier);
    const issues = rejectedQuestions(questionSet, local.issues, review);
    if (issues.size === 0) {
      const topicId = slugify(topic);
      const setSuffix = requestId.replace(/[^a-z0-9]/giu, "").toLowerCase().slice(0, 10);
      return {
        schema_version: "1.0",
        dataset_version: "ai-v1",
        topic: { id: topicId, name: topic },
        questions: questionSet.questions.map((question) => ({
          ...question,
          id: `ai-${topicId}-${setSuffix}-${question.id.slice(2)}`,
          review_status: "approved" as const,
        })),
      };
    }

    if (round === aiGenerationConfig.maxRepairRounds) break;
    questionSet = await repairRejected(topic, questionSet, issues, safetyIdentifier);
  }

  throw new AiGenerationError(
    "quality_failed",
    "The generated set did not pass quality review. No questions were published.",
    502,
  );
}
