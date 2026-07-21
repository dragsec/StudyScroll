import { expect, test, type Locator, type Page } from "@playwright/test";

const javascriptQuestionId = "javascript-default-sort";

async function chooseJavaScript(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "All topics" }).click();

  const topicSheet = page.getByRole("dialog", { name: "Choose topics" });
  await expect(topicSheet).toBeVisible();
  await topicSheet.getByPlaceholder("Search topics").fill("javascript");
  const javascriptOption = topicSheet.getByRole("option", { name: /JavaScript\s+12/ });
  await javascriptOption.click();
  await expect(javascriptOption).toHaveAttribute("aria-selected", "true");
  await topicSheet.getByRole("button", { name: "Done" }).click();

  await expect(
    page.getByRole("button", { name: "JavaScript", exact: true }),
  ).toBeVisible();
  const card = page.locator(`[data-question-id="${javascriptQuestionId}"]`);
  await expect(card).toBeVisible();
  return card;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("a guest can discover, filter, and save a learning card", async ({ page }) => {
  await expect(page).toHaveTitle(/StudyScroll/);
  await page.getByRole("link", { name: "Start learning" }).first().click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("region", { name: "Learning feed" })).toBeVisible();

  const firstCard = await chooseJavaScript(page);

  const javascriptPrompt = (await firstCard.locator(".question-title").textContent())?.trim();
  expect(javascriptPrompt).toBeTruthy();
  await firstCard.getByRole("button", { name: "Save challenge" }).click();
  await expect(page.locator(".toast")).toHaveText("Saved for later");

  await page.getByRole("button", { name: "saved", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Saved cards" })).toBeVisible();
  await expect(page.locator(`[data-question-id="${javascriptQuestionId}"]`)).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "saved", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Saved cards" })).toBeVisible();
  await expect(page.locator(`[data-question-id="${javascriptQuestionId}"]`)).toBeVisible();
});

test("a perfect answer is graded by the server and updates progress", async ({ page }) => {
  await page.goto("/learn");
  const firstCard = await chooseJavaScript(page);

  const javascriptPrompt = (await firstCard.locator(".question-title").textContent())?.trim();
  expect(javascriptPrompt).toBeTruthy();
  await firstCard.getByRole("button", { name: "ANSWER" }).click();

  const answerSheet = page.getByRole("dialog", { name: "Answer challenge" });
  await expect(answerSheet.getByRole("heading", { name: javascriptPrompt! })).toBeVisible();

  const answers = answerSheet.locator(".answer-card");
  await expect(answers).toHaveCount(3);
  await answers.nth(0).getByRole("button", { name: "sus" }).click();
  await answers.nth(1).getByRole("button", { name: "legit" }).click();
  await answers.nth(2).getByRole("button", { name: "sus" }).click();

  await expect(answerSheet.getByText("3/3 judgments made")).toBeVisible();
  await answerSheet.getByRole("button", { name: "Check my judgments" }).click();
  await expect(answerSheet.getByText("3/3 judged well")).toBeVisible();
  await expect(answerSheet.getByText("Correct!", { exact: true })).toHaveCount(3);

  await answerSheet.getByRole("button", { name: "Back to feed" }).click();
  await page.getByRole("button", { name: "progress", exact: true }).click();

  const dailyProgress = page.getByRole("progressbar", {
    name: "Today's perfect questions",
  });
  await expect(dailyProgress).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByText("1/5", { exact: true })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "progress", exact: true }).click();
  await expect(
    page.getByRole("progressbar", { name: "Today's perfect questions" }),
  ).toHaveAttribute("aria-valuenow", "1");
});

test("a guest can reach the account creation flow", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("button", { name: "profile", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Keep your progress" })).toBeVisible();
  await page.getByRole("link", { name: "Create free account" }).click();

  await expect(page).toHaveURL(/\/auth\?mode=signup$/);
  await expect(page.getByRole("heading", { name: "Keep your momentum" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign up" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("Passwords are hashed by Supabase Auth.", { exact: false })).toBeVisible();
});

test("opening the topic sheet preserves the feed position", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "The mobile feed owns this scroll container.");
  await page.goto("/learn");
  const appView = page.locator(".app-view");
  await expect(page.getByRole("region", { name: "Learning feed" })).toBeVisible();
  await expect(page.locator(".question-card:not(.question-card-skeleton)")).toHaveCount(12);

  await appView.evaluate((element) => {
    element.scrollTop = 600;
  });
  const scrollPosition = await appView.evaluate((element) => element.scrollTop);
  expect(scrollPosition).toBeGreaterThan(0);

  await page.getByRole("button", { name: "All topics" }).click();
  await expect(page.getByRole("dialog", { name: "Choose topics" })).toBeVisible();
  await expect(page.getByPlaceholder("Search topics")).not.toBeFocused();
  await expect.poll(() => appView.evaluate((element) => element.scrollTop)).toBe(scrollPosition);
});
