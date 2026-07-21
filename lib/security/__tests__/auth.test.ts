import assert from "node:assert/strict";
import test from "node:test";
import { authDestination, authRedirectOrigin } from "../auth-redirect";
import {
  createPasswordRecoveryProof,
  verifyPasswordRecoveryProof,
} from "../recovery-proof";

test("auth callbacks allow only known internal destinations", () => {
  assert.equal(authDestination("/account", null), "/account");
  assert.equal(authDestination("/learn", null), "/learn");
  for (const attack of [
    "https://attacker.example",
    "//attacker.example",
    "/\\attacker.example",
    "/%2f%2fattacker.example",
    "/auth/reset?mode=update",
  ]) {
    assert.equal(authDestination(attack, null), "/learn");
  }
  assert.equal(authDestination("https://attacker.example", "recovery"), "/auth/reset?mode=update");
});

test("production callbacks fail closed without a trusted HTTPS origin", () => {
  assert.equal(
    authRedirectOrigin("https://host-header.example/auth/callback", { NODE_ENV: "production" }),
    null,
  );
  assert.equal(
    authRedirectOrigin("https://host-header.example/auth/callback", {
      NODE_ENV: "production",
      APP_ORIGIN: "http://studyscroll.example",
    }),
    null,
  );
  assert.equal(
    authRedirectOrigin("https://host-header.example/auth/callback", {
      NODE_ENV: "production",
      APP_ORIGIN: "https://studyscroll.example/path",
    }),
    "https://studyscroll.example",
  );
});

test("preview and local callbacks use bounded trusted origins", () => {
  assert.equal(
    authRedirectOrigin("http://127.0.0.1:4173/auth/callback", { NODE_ENV: "development" }),
    "http://127.0.0.1:4173",
  );
  assert.equal(
    authRedirectOrigin("https://ignored.example/auth/callback", {
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_URL: "studyscroll-preview.vercel.app",
    }),
    "https://studyscroll-preview.vercel.app",
  );
});

test("password recovery proofs are user-bound, expiring, and tamper-evident", () => {
  const secret = "a-secure-test-secret-that-is-longer-than-32-characters";
  const now = Date.parse("2026-07-21T12:00:00.000Z");
  const proof = createPasswordRecoveryProof("user-a", now, secret);
  assert.ok(proof);
  assert.equal(verifyPasswordRecoveryProof(proof, "user-a", now, secret), true);
  assert.equal(verifyPasswordRecoveryProof(proof, "user-b", now, secret), false);
  assert.equal(verifyPasswordRecoveryProof(`${proof}x`, "user-a", now, secret), false);
  assert.equal(verifyPasswordRecoveryProof(proof, "user-a", now + 11 * 60_000, secret), false);
});
