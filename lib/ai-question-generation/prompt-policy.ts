import { aiGenerationConfig } from "./config";
import { AiGenerationError } from "./errors";

const injectionPatterns = [
  /ignore\s+(all|any|the|previous|prior)\b/iu,
  /forget\s+(all|the|your)\s+(rules|instructions|prompt)/iu,
  /reveal\s+(the\s+)?(system|developer|hidden)\s+(prompt|message|instructions)/iu,
  /follow\s+these\s+instructions/iu,
  /override\s+(the\s+)?(rules|instructions|prompt)/iu,
  /you\s+are\s+now\b/iu,
  /\bjailbreak\b/iu,
  /<\/?(system|developer|assistant)>/iu,
  /\[(system|developer|assistant)\]/iu,
];

export function normalizeTopic(rawTopic: string): string {
  return rawTopic.normalize("NFKC").replace(/[\u0000-\u001F\u007F]/gu, " ").trim().replace(/\s+/gu, " ");
}

export function countWords(value: string): number {
  return value.length === 0 ? 0 : value.split(/\s+/u).length;
}

export function validateTopicLocally(rawTopic: string): string {
  const topic = normalizeTopic(rawTopic);

  if (topic.length < 2 || topic.length > aiGenerationConfig.maxTopicCharacters) {
    throw new AiGenerationError(
      "invalid_topic",
      `Use between 2 and ${aiGenerationConfig.maxTopicCharacters} characters.`,
      400,
    );
  }

  const wordCount = countWords(topic);
  if (wordCount > aiGenerationConfig.maxTopicWords) {
    throw new AiGenerationError(
      "invalid_topic",
      `Keep the topic to ${aiGenerationConfig.maxTopicWords} words or fewer.`,
      400,
    );
  }

  if (!/[\p{L}\p{N}]/u.test(topic)) {
    throw new AiGenerationError("invalid_topic", "Enter a real learning topic.", 400);
  }

  if (/https?:\/\/|www\.|```/iu.test(topic) || injectionPatterns.some((pattern) => pattern.test(topic))) {
    throw new AiGenerationError(
      "invalid_topic",
      "Enter only the topic you want to study, without links or instructions.",
      400,
    );
  }

  return topic;
}
