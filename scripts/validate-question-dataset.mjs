import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { getEditorialCopy } from "./editorial-copy/index.mjs";

const datasetDir = path.join(process.cwd(), "datasets", "questions", "v1");
const expectedDifficulties = { easy: 3, medium: 6, hard: 3 };
const expectedTopics = 14;
const errors = [];
const globalQuestionIds = new Set();
const globalPrompts = new Map();
const globalAnswers = new Map();
const cannedOpeners = [
  "quick gut check:",
  "settle a debate for me:",
  "someone dropped this in the group chat:",
  "no searching:",
  "curious where people land on this:",
  "i've seen mixed takes, so:",
  "forum check:",
  "let's clear this one up:",
  "a teammate asked me this:",
  "before i confidently say the wrong thing:",
  "tiny knowledge check:",
  "this keeps starting arguments:",
  "i'd go with this:",
  "pretty sure this is the key:",
  "the way i understand it:",
  "this is what trips people up:",
  "my answer:",
  "i think the important part is this:",
  "from what i've seen,",
  "short version:",
  "this was the explanation that clicked for me:",
  "i'd phrase it like this:",
  "unless i'm mixing things up,",
  "the practical answer is:",
  "yep, this one checks out.",
  "this one is legit.",
  "not this one.",
  "good catch.",
  "a comment thread sent me down a rabbit hole.",
  "i need a second pair of eyes on this:",
  "two confident answers, zero agreement.",
  "no textbook speech, please.",
  "imagine this comes up in a code review:",
  "i thought i knew this until a teammate disagreed.",
  "can someone explain this without hand-waving:",
  "this feels obvious, which is making me suspicious.",
  "putting my notes on trial today:",
  "my study group split right down the middle.",
  "found an argument about this under a tutorial:",
  "pretend the multiple-choice options are gone:",
  "last check before i call this",
  "i read it this way:",
  "the one-line answer i would give:",
  "my notes reduce it to this:",
  "the key detail for me:",
  "my understanding:",
  "the practical reading:",
  "i keep coming back to this:",
  "the cleanest explanation i know:",
  "my mental model is simple:",
  "for me, it comes down to this:",
  "the useful rule of thumb:",
  "my quick explanation:",
];

function hasCannedOpener(value) {
  const normalized = value.trim().toLowerCase();
  return cannedOpeners.some((opener) => normalized.startsWith(opener));
}

function copyIssues(value) {
  const issues = [];
  if (/[\u2013\u2014\ufffd]/u.test(value)) issues.push("contains a dash or replacement character");
  if (/\s{2,}/u.test(value)) issues.push("contains repeated whitespace");
  if (/\s+[,.!?;:]/u.test(value)) issues.push("contains whitespace before punctuation");
  if ((value.match(/`/gu)?.length ?? 0) % 2 !== 0) issues.push("contains unbalanced backticks");
  if (!/[.!?`]$/u.test(value.trim())) issues.push("needs terminal punctuation");
  return issues;
}

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
    if (typeof question.prompt === "string" && hasCannedOpener(question.prompt)) {
      fail(file, `${question.id}: prompt starts with a banned canned opener`);
    }
    if (typeof question.prompt === "string" && !question.prompt.trim().endsWith("?")) {
      fail(file, `${question.id}: prompt must end with a question mark`);
    }
    if (typeof question.prompt === "string") {
      for (const issue of copyIssues(question.prompt)) fail(file, `${question.id}: prompt ${issue}`);
    }
    const editorialCopy = getEditorialCopy(question.id);
    if (!editorialCopy) {
      fail(file, `${question.id}: missing one-by-one editorial copy`);
    } else if (question.prompt !== editorialCopy.prompt) {
      fail(file, `${question.id}: prompt does not match the approved editorial copy`);
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
      if (typeof answer.text === "string" && hasCannedOpener(answer.text)) {
        fail(file, `${question.id}/${answer.id}: answer starts with a banned canned opener`);
      }
      if (typeof answer.text === "string") {
        for (const issue of copyIssues(answer.text)) fail(file, `${question.id}/${answer.id}: answer ${issue}`);
      }
      const answerIndex = question.answers.indexOf(answer);
      if (editorialCopy && answer.text !== editorialCopy.answers[answerIndex]) {
        fail(file, `${question.id}/${answer.id}: answer does not match the approved editorial copy`);
      }
      const normalizedAnswer = answer.text?.trim().toLowerCase();
      if (normalizedAnswer) {
        if (globalAnswers.has(normalizedAnswer)) {
          fail(file, `${question.id}/${answer.id}: duplicate answer also used by ${globalAnswers.get(normalizedAnswer)}`);
        }
        globalAnswers.set(normalizedAnswer, `${question.id}/${answer.id}`);
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
      if (hasCannedOpener(answer.feedback?.legit ?? "") || hasCannedOpener(answer.feedback?.sus ?? "")) {
        fail(file, `${question.id}/${answer.id}: feedback starts with a banned canned opener`);
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
