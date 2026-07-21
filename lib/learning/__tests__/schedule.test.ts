import assert from "node:assert/strict";
import test from "node:test";
import {
  dateKeyForTimeZone,
  nextQuestionReview,
  normalizeTimeZone,
} from "../schedule";

test("an imperfect question returns after ten minutes and resets its stage", () => {
  const now = new Date("2026-07-21T12:00:00.000Z");
  const review = nextQuestionReview(2, 3, 4, now);
  assert.equal(review.stage, 0);
  assert.equal(review.at.toISOString(), "2026-07-21T12:10:00.000Z");
});

test("perfect questions advance through bounded review intervals", () => {
  const now = new Date("2026-07-21T12:00:00.000Z");
  assert.equal(nextQuestionReview(3, 3, 0, now).at.toISOString(), "2026-07-22T12:00:00.000Z");
  assert.equal(nextQuestionReview(3, 3, 4, now).at.toISOString(), "2026-08-20T12:00:00.000Z");
  assert.equal(nextQuestionReview(3, 3, 99, now).stage, 5);
});

test("daily progress uses the learner's local calendar day", () => {
  const instant = new Date("2026-07-21T22:30:00.000Z");
  assert.equal(dateKeyForTimeZone("Europe/Rome", instant), "2026-07-22");
  assert.equal(dateKeyForTimeZone("America/New_York", instant), "2026-07-21");
});

test("invalid time zones fail closed to UTC", () => {
  assert.equal(normalizeTimeZone("Europe/Rome"), "Europe/Rome");
  assert.equal(normalizeTimeZone("Not/AZone"), "UTC");
  assert.equal(normalizeTimeZone({}), "UTC");
});
