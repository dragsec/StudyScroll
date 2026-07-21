import { expect, test } from "@playwright/test";

test("the public and guarded route surface returns deliberate responses", async ({ request }) => {
  for (const path of ["/", "/learn", "/auth", "/auth/reset", "/api/health"]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should be available`).toBe(200);
  }

  const feed = await request.get("/api/questions");
  expect(feed.status()).toBe(200);
  const payload = await feed.json();
  expect(payload.meta.count).toBe(168);
  expect(payload.questions[0].answers[0]).not.toHaveProperty("verdict");
  expect(payload.questions[0].answers[0]).not.toHaveProperty("feedback");

  const account = await request.get("/account", { maxRedirects: 0 });
  expect(account.status()).toBe(307);
  expect(account.headers().location).toBe("/auth");

  const accountState = await request.get("/api/account/state");
  expect(accountState.status()).toBe(401);

  const directRecovery = await request.get("/auth/reset?mode=update", { maxRedirects: 0 });
  expect(directRecovery.status()).toBe(307);
  expect(directRecovery.headers().location).toBe("/auth/reset?error=invalid-link");

  expect((await request.post("/api/questions")).status()).toBe(405);
});
