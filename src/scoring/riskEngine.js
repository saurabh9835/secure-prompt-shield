"use strict";

const { CATEGORY_WEIGHTS, MATCH_TYPE_WEIGHTS } = require("./weights");
const { scoreToSeverity } = require("./severityMap");

/**
 * Per-finding contribution, before diminishing returns:
 *   contribution = categoryWeight * matchTypeWeight * confidence * 100
 *
 * Findings are then combined with diminishing returns per category so that
 * N matches in the same category don't scale linearly to 100 (stacking
 * many low-signal matches shouldn't trivially reach "critical").
 * Different categories combine more additively, since co-occurrence across
 * categories is itself a stronger signal (see heuristicEngine's stacking
 * heuristic, which also feeds into this).
 *
 * @param {Array<object>} findings - findings from all engines, deduped
 * @returns {number} risk score 0-100
 */
function computeRiskScore(findings) {
  if (!Array.isArray(findings) || findings.length === 0) return 0;

  // Group findings by category.
  const byCategory = new Map();
  for (const f of findings) {
    const list = byCategory.get(f.category) || [];
    list.push(f);
    byCategory.set(f.category, list);
  }

  let categoryScores = [];

  for (const [category, categoryFindings] of byCategory.entries()) {
    const categoryWeight = CATEGORY_WEIGHTS[category] ?? 0.5;

    // Sort contributions descending, apply diminishing returns: 1st finding
    // full weight, 2nd at 50%, 3rd at 25%, etc. (geometric decay).
    const contributions = categoryFindings
      .map((f) => {
        const matchTypeWeight = MATCH_TYPE_WEIGHTS[f.matchType] ?? 0.7;
        const confidence = typeof f.confidence === "number" ? f.confidence : 0.5;
        return categoryWeight * matchTypeWeight * confidence * 100;
      })
      .sort((a, b) => b - a);

    const categoryScore = contributions.reduce(
      (sum, contribution, i) => sum + contribution * Math.pow(0.5, i),
      0
    );

    categoryScores.push(Math.min(100, categoryScore));
  }

  // Combine across categories: take the max as the base (a single strong
  // category shouldn't be diluted), then add a smaller bonus for each
  // additional category present (multi-category co-occurrence aggravates
  // risk, per Design Decision in the architecture doc).
  categoryScores.sort((a, b) => b - a);
  const [top, ...rest] = categoryScores;
  const coOccurrenceBonus = rest.reduce((sum, s, i) => sum + s * 0.15 * Math.pow(0.6, i), 0);

  const finalScore = Math.round(Math.min(100, top + coOccurrenceBonus));
  return finalScore;
}

/**
 * Convenience wrapper returning both score and severity together.
 * @param {Array<object>} findings
 * @returns {{ riskScore: number, severity: string }}
 */
function scoreAndSeverity(findings) {
  const riskScore = computeRiskScore(findings);
  return { riskScore, severity: scoreToSeverity(riskScore) };
}

module.exports = { computeRiskScore, scoreAndSeverity };
