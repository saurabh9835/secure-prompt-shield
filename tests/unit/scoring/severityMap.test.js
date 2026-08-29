"use strict";

const { scoreToSeverity } = require("../../../src/scoring/severityMap");

describe("severityMap", () => {
  it.each([
    [0, "low"],
    [30, "low"],
    [31, "medium"],
    [60, "medium"],
    [61, "high"],
    [80, "high"],
    [81, "critical"],
    [100, "critical"]
  ])("maps score %i to severity %s", (score, expected) => {
    expect(scoreToSeverity(score)).toBe(expected);
  });
});
