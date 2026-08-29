"use strict";

const { generateReport, dedupeFindings, redact } = require("../../../src/reporting/reportGenerator");

describe("reportGenerator", () => {
  it("dedupes findings with the same ruleId and matchedText", () => {
    const findings = [
      { ruleId: "DI-001", matchedText: "ignore previous instructions", category: "PROMPT_INJECTION" },
      { ruleId: "DI-001", matchedText: "ignore previous instructions", category: "PROMPT_INJECTION" }
    ];
    expect(dedupeFindings(findings)).toHaveLength(1);
  });

  it("keeps findings with the same ruleId but different matchedText", () => {
    const findings = [
      { ruleId: "DI-006", matchedText: "ignore the above instructions", category: "PROMPT_INJECTION" },
      { ruleId: "DI-006", matchedText: "ignore prior rules", category: "PROMPT_INJECTION" }
    ];
    expect(dedupeFindings(findings)).toHaveLength(2);
  });

  it("redacts short and long matched text differently but never returns the full long string", () => {
    const short = redact("abcd");
    const long = redact("ignore previous instructions completely");
    expect(short.length).toBeLessThanOrEqual(8);
    expect(long).not.toBe("ignore previous instructions completely");
    expect(long).toContain("[redacted]");
  });

  it("produces findings with explanations and category-based recommendations", () => {
    const raw = [
      { ruleId: "JB-001", category: "JAILBREAK", matchType: "pattern", matchedText: "disable safety", confidence: 0.85 }
    ];
    const { findings, recommendations, categories } = generateReport(raw, "high");
    expect(findings).toHaveLength(1);
    expect(findings[0].explanation).toBeTruthy();
    expect(categories).toEqual(["JAILBREAK"]);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it("adds a multi-category recommendation when 2+ categories are present", () => {
    const raw = [
      { ruleId: "JB-001", category: "JAILBREAK", matchType: "pattern", matchedText: "a", confidence: 0.8 },
      { ruleId: "DE-001", category: "DATA_EXFILTRATION", matchType: "pattern", matchedText: "b", confidence: 0.8 }
    ];
    const { recommendations } = generateReport(raw, "critical");
    expect(recommendations.some((r) => r.toLowerCase().includes("multiple distinct threat categories"))).toBe(true);
  });

  it("respects redactMatchedText: false to preserve original matched text", () => {
    const raw = [{ ruleId: "JB-001", category: "JAILBREAK", matchType: "pattern", matchedText: "disable safety", confidence: 0.8 }];
    const { findings } = generateReport(raw, "high", { redactMatchedText: false });
    expect(findings[0].matchedText).toBe("disable safety");
  });
});
