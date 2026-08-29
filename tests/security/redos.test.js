"use strict";

const { BUILTIN_RULES } = require("../../src/rules");

/**
 * Builds a pathological input string designed to trigger catastrophic
 * backtracking in vulnerable regex patterns (repeated character runs
 * followed by a non-matching tail), then asserts each regex rule completes
 * well within budget. This is the primary ReDoS defense referenced in
 * engines/regexEngine.js and the architecture doc.
 */
describe("security: ReDoS audit of all regex rules", () => {
  const regexRules = BUILTIN_RULES.filter((r) => r.type === "regex");
  const pathologicalInputs = [
    "a".repeat(5000) + "!",
    "the ".repeat(2000) + "x",
    " ".repeat(3000) + "ignore",
    "1".repeat(4000) + "z"
  ];

  it.each(regexRules.map((r) => [r.id]))("%s completes within budget on pathological input", (id) => {
    const rule = regexRules.find((r) => r.id === id);
    for (const input of pathologicalInputs) {
      const start = Date.now();
      rule.value.lastIndex = 0;
      rule.value.test(input);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(200);
    }
  });
});
