"use strict";

const { CATEGORY_EXPLANATIONS, SEVERITY_RECOMMENDATIONS } = require("./templates");

/**
 * De-duplicates raw findings by (ruleId + matchedText) so the same rule
 * firing on the same substring twice (e.g. via original + decoded buffers)
 * doesn't appear twice in the report, while still allowing the same rule
 * to appear multiple times for genuinely different matched text.
 *
 * @param {Array<object>} findings
 * @returns {Array<object>}
 */
function dedupeFindings(findings) {
  const seen = new Set();
  const out = [];
  for (const f of findings) {
    const key = `${f.ruleId}::${f.matchedText}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(f);
    }
  }
  return out;
}

/**
 * Redacts matched text for safe logging/display when configured to do so.
 * Keeps enough context to be useful (first few chars) without echoing the
 * full injection payload back out.
 *
 * @param {string} text
 * @returns {string}
 */
function redact(text) {
  if (typeof text !== "string") return "";
  if (text.length <= 12) return `${text.slice(0, 4)}***`;
  return `${text.slice(0, 8)}...[redacted]`;
}

/**
 * Builds the final report: deduped, human-readable findings array plus
 * a set of severity-driven recommendations.
 *
 * @param {Array<object>} rawFindings
 * @param {string} severity
 * @param {{ redactMatchedText: boolean }} [options]
 * @returns {{ findings: Array<object>, recommendations: Array<string>, categories: Array<string> }}
 */
function generateReport(rawFindings, severity, options = {}) {
  const { redactMatchedText = true } = options;
  const deduped = dedupeFindings(rawFindings || []);

  const findings = deduped.map((f) => ({
    category: f.category,
    ruleId: f.ruleId,
    matchType: f.matchType,
    matchedText: redactMatchedText ? redact(f.matchedText) : f.matchedText,
    confidence: f.confidence,
    explanation: CATEGORY_EXPLANATIONS[f.category] || "Potential prompt injection indicator detected."
  }));

  const categories = [...new Set(deduped.map((f) => f.category))];

  const recommendations = [];
  if (SEVERITY_RECOMMENDATIONS[severity]) {
    recommendations.push(SEVERITY_RECOMMENDATIONS[severity]);
  }
  if (categories.length > 1) {
    recommendations.push(
      "Multiple distinct threat categories detected in a single prompt — treat as an aggravating factor."
    );
  }

  return { findings, recommendations, categories };
}

module.exports = { generateReport, dedupeFindings, redact };
