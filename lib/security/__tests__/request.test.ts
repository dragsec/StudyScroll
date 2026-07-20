import assert from "node:assert/strict";
import test from "node:test";
import { questions } from "../../../data/questions";
import { toPublicQuestion } from "../../../data/question-types";
import { isSafeReferenceUrl } from "../../ai-question-generation/url-policy";
import {
  assertTrustedMutation,
  hasJsonContentType,
  readLimitedJson,
  RequestSecurityError,
} from "../request";

function trustedRequest(body = JSON.stringify({ topic: "SQL" })) {
  return new Request("https://studyscroll.example/api/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Origin: "https://studyscroll.example",
      "Sec-Fetch-Site": "same-origin",
      "X-StudyScroll-Request": "1",
    },
    body,
  });
}

test("accepts a verified same-origin mutation", () => {
  assert.doesNotThrow(() => assertTrustedMutation(trustedRequest()));
});

test("rejects missing, cross-site, and mismatched mutation signals", () => {
  const missingHeader = new Request("https://studyscroll.example/api/test", {
    method: "POST",
    headers: { Origin: "https://studyscroll.example" },
  });
  const crossSite = new Request("https://studyscroll.example/api/test", {
    method: "POST",
    headers: {
      Origin: "https://attacker.example",
      "Sec-Fetch-Site": "cross-site",
      "X-StudyScroll-Request": "1",
    },
  });
  const noOrigin = new Request("https://studyscroll.example/api/test", {
    method: "POST",
    headers: { "Sec-Fetch-Site": "same-origin", "X-StudyScroll-Request": "1" },
  });

  for (const request of [missingHeader, crossSite, noOrigin]) {
    assert.throws(() => assertTrustedMutation(request), RequestSecurityError);
  }
});

test("accepts only the JSON media type", () => {
  assert.equal(hasJsonContentType(trustedRequest()), true);
  assert.equal(
    hasJsonContentType(new Request("https://studyscroll.example", {
      headers: { "Content-Type": "application/json.evil" },
    })),
    false,
  );
});

test("parses bounded JSON and rejects oversized bodies", async () => {
  assert.deepEqual(await readLimitedJson(trustedRequest(), 512), { topic: "SQL" });

  await assert.rejects(
    readLimitedJson(trustedRequest(JSON.stringify({ topic: "x".repeat(600) })), 128),
    (error) => error instanceof RequestSecurityError && error.status === 413,
  );
});

test("the public feed DTO never includes verdicts or feedback", () => {
  const publicQuestion = toPublicQuestion(questions[0]);
  for (const answer of publicQuestion.answers) {
    assert.equal("verdict" in answer, false);
    assert.equal("feedback" in answer, false);
  }
});

test("rejects local, private, and credential-bearing reference URLs", () => {
  const blocked = [
    "https://localhost/docs",
    "https://127.0.0.1/docs",
    "https://0.0.0.0/docs",
    "https://169.254.169.254/latest/meta-data",
    "https://[::1]/docs",
    "https://[fd00::1]/docs",
    "https://user:password@example.com/docs",
  ];
  for (const url of blocked) assert.equal(isSafeReferenceUrl(url), false, url);
  assert.equal(isSafeReferenceUrl("https://docs.python.org/3/"), true);
});
