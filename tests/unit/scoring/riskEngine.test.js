"use strict";

const { computeRiskScore, scoreAndSeverity } = require("../../../src/scoring/riskEngine");

describe("riskEngine", () => {
  it("returns 0 for no findings", () => {
    expect(computeRiskScore([])).toBe(0);
    expect(computeRiskScore(undefined)).toBe(0);
  });

  it("returns a higher score for a high-confidence pattern match than a low-confidence heuristic", () => {
    const strong = [{ category: "JAILBREAK", matchType: "pattern", confidence: 0.9 }];
    const weak = [{ category: "INDIRECT_INJECTION", matchType: "heuristic", confidence: 0.3 }];
    expect(computeRiskScore(strong)).toBeGreaterThan(computeRiskScore(weak));
  });

  it("applies diminishing returns for repeated findings in the same category", () => {
    const one = [{ category: "PROMPT_INJECTION", matchType: "pattern", confidence: 0.9 }];
    const three = [
      { category: "PROMPT_INJECTION", matchType: "pattern", confidence: 0.9 },
      { category: "PROMPT_INJECTION", matchType: "pattern", confidence: 0.9 },
      { category: "PROMPT_INJECTION", matchType: "pattern", confidence: 0.9 }
    ];
    const oneScore = computeRiskScore(one);
    const threeScore = computeRiskScore(three);
    expect(threeScore).toBeGreaterThan(oneScore);
    // Diminishing returns: should NOT be anywhere near 3x the single score.
    expect(threeScore).toBeLessThan(oneScore * 2);
  });

  it("adds a co-occurrence bonus for multiple distinct categories", () => {
    const single = [{ category: "JAILBREAK", matchType: "pattern", confidence: 0.9 }];
    const multi = [
      { category: "JAILBREAK", matchType: "pattern", confidence: 0.9 },
      { category: "DATA_EXFILTRATION", matchType: "pattern", confidence: 0.9 }
    ];
    expect(computeRiskScore(multi)).toBeGreaterThan(computeRiskScore(single));
  });

  it("never exceeds 100", () => {
    const many = Array.from({ length: 20 }, () => ({
      category: "DATA_EXFILTRATION",
      matchType: "pattern",
      confidence: 1
    }));
    expect(computeRiskScore(many)).toBeLessThanOrEqual(100);
  });

  it("maps score to severity correctly via scoreAndSeverity", () => {
    const { severity } = scoreAndSeverity([
      { category: "DATA_EXFILTRATION", matchType: "pattern", confidence: 1 }
    ]);
    expect(["low", "medium", "high", "critical"]).toContain(severity);
  });
});
