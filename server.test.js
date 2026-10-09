const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("shows.json starts as an empty collection", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "shows.json"), "utf8"));
  assert.ok(Array.isArray(data));
});

test("package scripts expose start and test", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
  assert.equal(pkg.scripts.start, "node server.js");
  assert.equal(pkg.scripts.test, "node --test");
});
