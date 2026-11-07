import test from "node:test";
import assert from "node:assert/strict";
import { matchField } from "../matcher.js";

test("recognizes portfolio wording", () => {
  assert.equal(matchField(["Link to your work"]), "portfolio");
});

test("normalizes required markers", () => {
  assert.equal(matchField(["GitHub Repository URL *"]), "repo");
});

test("leaves impact questions unfilled", () => {
  assert.equal(matchField(["How many projects use your tool?"]), undefined);
});

test("respects visible labels over generic internal names", () => {
  assert.equal(matchField(["Reference email", "email"]), undefined);
});

test("can use a secondary label when the first is empty", () => {
  assert.equal(matchField(["", "Project description"]), "summary");
});
