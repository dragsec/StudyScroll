import assert from "node:assert/strict";
import test from "node:test";
import { questions } from "../../../data/questions";

test("every simulated thread uses four distinct profiles", () => {
  assert.equal(questions.length, 168);
  for (const question of questions) {
    const handles = [question.author.handle, ...question.answers.map((answer) => answer.handle)];
    assert.equal(new Set(handles).size, 4, `${question.id} repeats a profile inside one thread`);
  }
});

test("each fictional handle keeps one coherent role", () => {
  const roleByHandle = new Map<string, string>();
  const authors = new Set<string>();
  const commenters = new Set<string>();

  for (const question of questions) {
    authors.add(question.author.handle);
    const profiles = [question.author, ...question.answers];

    for (const profile of profiles) {
      const existingRole = roleByHandle.get(profile.handle);
      if (existingRole) {
        assert.equal(profile.role, existingRole, `${profile.handle} changes roles`);
      } else {
        roleByHandle.set(profile.handle, profile.role);
      }
    }

    for (const answer of question.answers) commenters.add(answer.handle);
  }

  assert.equal(roleByHandle.size, 12);
  assert.deepEqual(authors, commenters, "every profile should participate as both author and commenter");
});
