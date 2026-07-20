export type AiGenerationErrorCode =
  | "feature_disabled"
  | "premium_required"
  | "invalid_request"
  | "invalid_topic"
  | "unsafe_topic"
  | "off_topic"
  | "provider_failure"
  | "quality_failed";

export class AiGenerationError extends Error {
  constructor(
    public readonly code: AiGenerationErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AiGenerationError";
  }
}
