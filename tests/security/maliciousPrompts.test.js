"use strict";

const { scanPrompt } = require("../../src/scanner");
const maliciousFixtures = require("../fixtures/malicious.json");

describe("security corpus: malicious prompts", () => {
  it.each(maliciousFixtures.map((f) => [f.id, f.category, f.prompt]))(
    "%s (%s) is flagged as unsafe",
    (id, category, prompt) => {
      const result = scanPrompt(prompt, { threshold: 50, logEvents: false });
      expect(result.safe).toBe(false);
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.findings.length).toBeGreaterThan(0);
    }
  );

  it("assigns riskScore, severity, and categories consistently", () => {
    for (const fixture of maliciousFixtures) {
      const result = scanPrompt(fixture.prompt, { logEvents: false });
      expect(typeof result.riskScore).toBe("number");
      expect(["low", "medium", "high", "critical"]).toContain(result.severity);
      expect(Array.isArray(result.categories)).toBe(true);
    }
  });

  it("flags the multi-category stacking prompt with critical or high severity", () => {
    const stacked = maliciousFixtures.find((f) => f.id === "m-15");
    const result = scanPrompt(stacked.prompt, { logEvents: false });
    expect(["high", "critical"]).toContain(result.severity);
    expect(result.categories.length).toBeGreaterThanOrEqual(2);
  });
});
