const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const;
const IMPERFECT_RETRY_MINUTES = 10;

export function normalizeTimeZone(value: unknown) {
  if (typeof value !== "string" || value.length > 64) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return value;
  } catch {
    return "UTC";
  }
}

export function dateKeyForTimeZone(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function nextQuestionReview(
  score: number,
  total: number,
  currentStage: number,
  now: Date,
) {
  if (score !== total) {
    return {
      stage: 0,
      at: new Date(now.getTime() + IMPERFECT_RETRY_MINUTES * 60_000),
    };
  }

  const stage = Math.min(currentStage + 1, REVIEW_INTERVAL_DAYS.length - 1);
  return {
    stage,
    at: new Date(now.getTime() + REVIEW_INTERVAL_DAYS[stage] * 86_400_000),
  };
}
