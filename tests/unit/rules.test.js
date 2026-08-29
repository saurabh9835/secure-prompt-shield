"use strict";

const { validateRule } = require("../../src/rules/ruleSchema");
const { getActiveRules, BUILTIN_RULES } = require("../../src/rules");

describe("ruleSchema", () => {
  it("accepts a valid pattern rule", () => {
    expect(() =>
      validateRule({
        id: "TEST-001",
        category: "PROMPT_INJECTION",
        type: "pattern",
        value: "test phrase",
        weight: 0.5,
        description: "A test rule"
      })
    ).not.toThrow();
  });

  it("accepts a valid regex rule", () => {
    expect(() =>
      validateRule({
        id: "TEST-002",
        category: "JAILBREAK",
        type: "regex",
        value: /test/i,
        weight: 0.5,
        description: "A test regex rule"
      })
    ).not.toThrow();
  });

  it("rejects an unknown category", () => {
    expect(() =>
      validateRule({
        id: "TEST-003",
        category: "NOT_A_REAL_CATEGORY",
        type: "pattern",
        value: "x",
        weight: 0.5,
        description: "bad"
      })
    ).toThrow(TypeError);
  });

  it("rejects a weight out of 0-1 range", () => {
    expect(() =>
      validateRule({
        id: "TEST-004",
        category: "JAILBREAK",
        type: "pattern",
        value: "x",
        weight: 1.5,
        description: "bad weight"
      })
    ).toThrow(RangeError);
  });

  it("rejects a pattern rule whose value is not a string", () => {
    expect(() =>
      validateRule({
        id: "TEST-005",
        category: "JAILBREAK",
        type: "pattern",
        value: /oops/,
        weight: 0.5,
        description: "bad value type"
      })
    ).toThrow(TypeError);
  });
});

describe("rules/index", () => {
  it("all built-in rules have unique ids", () => {
    const ids = BUILTIN_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getActiveRules returns only built-ins when no custom patterns given", () => {
    expect(getActiveRules()).toHaveLength(BUILTIN_RULES.length);
  });

  it("getActiveRules appends valid custom patterns", () => {
    const custom = [
      {
        id: "CUSTOM-001",
        category: "JAILBREAK",
        type: "pattern",
        value: "my custom trigger phrase",
        weight: 0.7,
        description: "custom test rule"
      }
    ];
    const active = getActiveRules(custom);
    expect(active).toHaveLength(BUILTIN_RULES.length + 1);
    expect(active.find((r) => r.id === "CUSTOM-001")).toBeDefined();
  });

  it("getActiveRules throws on an invalid custom pattern", () => {
    const custom = [{ id: "BAD", category: "NOPE", type: "pattern", value: "x", weight: 0.5, description: "d" }];
    expect(() => getActiveRules(custom)).toThrow(TypeError);
  });
});
