export const aiGenerationConfig = {
  enabled: process.env.AI_QUESTION_GENERATION_ENABLED === "true",
  generationModel: process.env.AI_GENERATION_MODEL ?? "gpt-5.6-sol",
  gateModel: process.env.AI_GATE_MODEL ?? "gpt-5.6-terra",
  reviewerModel: process.env.AI_REVIEW_MODEL ?? "gpt-5.6-sol",
  moderationModel: "omni-moderation-latest",
  questionCount: 20,
  maxTopicWords: 10,
  maxTopicCharacters: 80,
  maxRepairRounds: 2,
} as const;
