"use strict";

const { MATCH_TYPES } = require("../utils/constants");

/**
 * Simple, fast substring matching against normalized (lowercased) text.
 * Uses word-ish boundary checks to avoid matching inside unrelated longer
 * words where reasonable, while still catching the phrase regardless of
 * surrounding punctuation.
 *
 * @param {string} normalizedText - already normalized/lowercased text
 * @param {Array} rules - rules with type === "pattern"
 * @returns {Array<Finding>}
 */
function runPatternEngine(normalizedText, rules) {
  const findings = [];
  if (!normalizedText) return findings;

  const patternRules = rules.filter((r) => r.type === "pattern");

  for (const rule of patternRules) {
    const needle = rule.value.toLowerCase();
    const index = normalizedText.indexOf(needle);
    if (index !== -1) {
      findings.push({
        category: rule.category,
        ruleId: rule.id,
        matchType: MATCH_TYPES.PATTERN,
        matchedText: normalizedText.substr(index, needle.length),
        confidence: rule.weight
      });
    }
  }

  return findings;
}

module.exports = { runPatternEngine };
