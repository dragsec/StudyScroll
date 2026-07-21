import aws from "./aws.mjs";
import calculus from "./calculus.mjs";
import discreteMaths from "./discrete-maths.mjs";
import docker from "./docker.mjs";
import dsa from "./dsa.mjs";
import java from "./java.mjs";
import javascript from "./javascript.mjs";
import linux from "./linux.mjs";
import networking from "./networking.mjs";
import operatingSystems from "./operating-systems.mjs";
import python from "./python.mjs";
import springBoot from "./spring-boot.mjs";
import sql from "./sql.mjs";
import systemDesign from "./system-design.mjs";

const topicCopy = [
  aws,
  calculus,
  discreteMaths,
  docker,
  dsa,
  java,
  javascript,
  linux,
  networking,
  operatingSystems,
  python,
  springBoot,
  sql,
  systemDesign,
];

const editorialCopy = new Map();

for (const topic of topicCopy) {
  for (const [questionId, copy] of Object.entries(topic)) {
    if (editorialCopy.has(questionId)) {
      throw new Error(`Duplicate editorial copy for ${questionId}.`);
    }
    if (!copy.prompt?.trim().endsWith("?") || copy.answers?.length !== 3) {
      throw new Error(`Incomplete editorial copy for ${questionId}.`);
    }
    editorialCopy.set(questionId, copy);
  }
}

if (editorialCopy.size !== 168) {
  throw new Error(`Expected editorial copy for 168 questions, found ${editorialCopy.size}.`);
}

export function applyEditorialCopy(question) {
  const copy = editorialCopy.get(question.id);
  if (!copy) throw new Error(`Missing editorial copy for ${question.id}.`);
  if (question.answers.length !== copy.answers.length) {
    throw new Error(`Answer count changed for ${question.id}.`);
  }
  return {
    ...question,
    prompt: copy.prompt,
    answers: question.answers.map((answer, index) => ({
      ...answer,
      text: copy.answers[index],
    })),
  };
}

export function getEditorialCopy(questionId) {
  return editorialCopy.get(questionId);
}
