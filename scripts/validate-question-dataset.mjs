import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const datasetDir = path.join(process.cwd(), "datasets", "questions", "v1");
const expectedDifficulties = { easy: 3, medium: 6, hard: 3 };
const expectedTopics = 14;
const errors = [];
const globalQuestionIds = new Set();
const globalPrompts = new Map();

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

const files = (await readdir(datasetDir)).filter((file) => file.endsWith(".json")).sort();
if (files.length !== expectedTopics) {
  fail("dataset", `expected ${expectedTopics} topic files, found ${files.length}`);
}

for (const file of files) {
  const fullPath = path.join(datasetDir, file);
  let data;
  try {
    data = JSON.parse(await readFile(fullPath, "utf8"));
  } catch (error) {
    fail(file, `invalid JSON: ${error.message}`);
    continue;
  }

  if (data.schema_version !== "1.0") fail(file, "schema_version must be 1.0");
  if (!data.dataset_version) fail(file, "dataset_version is required");
  if (!data.topic?.id || !data.topic?.name) fail(file, "topic id and name are required");
  if (!Array.isArray(data.questions) || data.questions.length !== 12) {
    fail(file, `expected 12 questions, found ${data.questions?.length ?? 0}`);
    continue;
  }

  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  const susCountDistribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const question of data.questions) {
    if (!question.id) fail(file, "question id is required");
    if (globalQuestionIds.has(question.id)) fail(file, `duplicate question id ${question.id}`);
    globalQuestionIds.add(question.id);
    if (!(question.difficulty in difficultyCounts)) {
      fail(file, `${question.id}: invalid difficulty ${question.difficulty}`);
    } else {
      difficultyCounts[question.difficulty] += 1;
    }
    if (typeof question.prompt !== "string" || question.prompt.length < 10) {
      fail(file, `${question.id}: prompt is too short`);
    }
    if (typeof question.prompt === "string" && !question.prompt.trim().endsWith("?")) {
      fail(file, `${question.id}: prompt must end with a question mark`);
    }
    const normalizedPrompt = question.prompt?.trim().toLowerCase();
    if (normalizedPrompt) {
      if (globalPrompts.has(normalizedPrompt)) {
        fail(file, `${question.id}: duplicate prompt also used by ${globalPrompts.get(normalizedPrompt)}`);
      }
      globalPrompts.set(normalizedPrompt, question.id);
    }
    if (question.review_status !== "draft" && question.review_status !== "approved" && question.review_status !== "rejected") {
      fail(file, `${question.id}: invalid review_status`);
    }
    if (question.review_status !== "approved") {
      fail(file, `${question.id}: v1 questions must be approved after editorial review`);
    }
    if (!question.reference?.title || !/^https?:\/\//.test(question.reference?.url ?? "")) {
      fail(file, `${question.id}: valid reference title and URL are required`);
    }
    if (!Array.isArray(question.answers) || question.answers.length !== 3) {
      fail(file, `${question.id}: expected 3 answers`);
      continue;
    }
    const answerIds = new Set(question.answers.map((answer) => answer.id));
    if (answerIds.size !== 3 || !["a", "b", "c"].every((id) => answerIds.has(id))) {
      fail(file, `${question.id}: answer ids must be a, b, and c`);
    }
    const susCount = question.answers.filter((answer) => answer.verdict === "sus").length;
    if (susCount in susCountDistribution) susCountDistribution[susCount] += 1;
    const normalizedAnswers = question.answers.map((answer) => answer.text?.trim().toLowerCase());
    if (new Set(normalizedAnswers).size !== normalizedAnswers.length) {
      fail(file, `${question.id}: answer texts must be unique`);
    }
    for (const answer of question.answers) {
      if (typeof answer.text !== "string" || answer.text.length < 5) {
        fail(file, `${question.id}/${answer.id}: answer text is too short`);
      }
      if (answer.verdict !== "legit" && answer.verdict !== "sus") {
        fail(file, `${question.id}/${answer.id}: invalid verdict`);
      }
      if (!answer.feedback?.legit || !answer.feedback?.sus) {
        fail(file, `${question.id}/${answer.id}: feedback for both choices is required`);
      }
      if (answer.feedback?.legit === answer.feedback?.sus) {
        fail(file, `${question.id}/${answer.id}: Legit and Sus feedback must differ`);
      }
      if (answer.verdict === "legit") {
        if (!answer.feedback?.legit?.startsWith("Yep, this one checks out.")) {
          fail(file, `${question.id}/${answer.id}: a legitimate answer needs confirming feedback for a Legit vote`);
        }
        if (!answer.feedback?.sus?.startsWith("This one is legit.")) {
          fail(file, `${question.id}/${answer.id}: a legitimate answer needs a correction for a Sus vote`);
        }
      }
      if (answer.verdict === "sus") {
        if (!answer.feedback?.legit?.startsWith("Not this one.")) {
          fail(file, `${question.id}/${answer.id}: a suspicious answer needs corrective feedback for a Legit vote`);
        }
        if (!answer.feedback?.sus?.startsWith("Good catch.")) {
          fail(file, `${question.id}/${answer.id}: a suspicious answer needs confirming feedback for a Sus vote`);
        }
      }
      if (answer.feedback?.legit?.includes("undefined") || answer.feedback?.sus?.includes("undefined")) {
        fail(file, `${question.id}/${answer.id}: feedback contains an undefined value`);
      }
    }
  }

  for (const [difficulty, expected] of Object.entries(expectedDifficulties)) {
    if (difficultyCounts[difficulty] !== expected) {
      fail(file, `expected ${expected} ${difficulty} questions, found ${difficultyCounts[difficulty]}`);
    }
  }
  const expectedSusDistribution = { 0: 2, 1: 6, 2: 3, 3: 1 };
  for (const [susCount, expected] of Object.entries(expectedSusDistribution)) {
    if (susCountDistribution[susCount] !== expected) {
      fail(file, `expected ${expected} questions with ${susCount} Sus answers, found ${susCountDistribution[susCount]}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Dataset validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${files.length} topic files and ${globalQuestionIds.size} questions.`);
