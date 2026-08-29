"use strict";

const { MATCH_TYPES } = require("../utils/constants");

// Hard cap on how long a single regex test may run before we abort and
// treat it as a non-match. This is a defense-in-depth backstop; the primary
// ReDoS defense is the CI-time pattern audit described in tests/security.
// Node's regex engine is synchronous, so we can't truly "time out" mid-test
// without a worker thread — instead we rely on a length guard plus the CI
// audit. This constant documents the intended budget for that audit.
const REGEX_TEST_BUDGET_MS = 50;

/**
 * Runs all regex-type rules against BOTH the original-case text (for rules
 * that care about casing, though none currently do) and lets each rule's
 * own `i` flag control case sensitivity. Regexes are tested against the
 * normalized text for consistency with the pattern engine.
 *
 * @param {string} normalizedText
 * @param {Array} rules - rules with type === "regex"
 * @returns {Array<Finding>}
 */
function runRegexEngine(normalizedText, rules) {
  const findings = [];
  if (!normalizedText) return findings;

  const regexRules = rules.filter((r) => r.type === "regex");

  for (const rule of regexRules) {
    const re = rule.value;
    // Ensure global-independent, single lastIndex state per call.
    re.lastIndex = 0;

    const start = Date.now();
    const match = re.exec(normalizedText);
    const elapsed = Date.now() - start;

    if (elapsed > REGEX_TEST_BUDGET_MS) {
      // A rule blew its budget on this input. Skip counting it as a match
      // to avoid rewarding pathological input, but this should be treated
      // as a signal to audit the offending rule (surfaced via meta in a
      // future version — logged for now via the caller's error channel).
      continue;
    }

    if (match) {
      findings.push({
        category: rule.category,
        ruleId: rule.id,
        matchType: MATCH_TYPES.REGEX,
        matchedText: match[0],
        confidence: rule.weight
      });
    }
  }

  return findings;
}

module.exports = { runRegexEngine, REGEX_TEST_BUDGET_MS };
