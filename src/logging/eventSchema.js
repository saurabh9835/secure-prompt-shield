"use strict";

/**
 * Builds the standardized security event object that gets passed to
 * whichever sink is configured. This is intentionally a small, stable
 * shape — sinks should not need to know about ScanResult internals.
 *
 * @param {object} params
 * @param {number} params.riskScore
 * @param {string} params.severity
 * @param {Array<string>} params.categories
 * @param {boolean} params.blocked
 * @param {number} params.scanTimeMs
 * @returns {object}
 */
function buildEvent({ riskScore, severity, categories, blocked, scanTimeMs }) {
  return {
    timestamp: new Date().toISOString(),
    riskScore,
    severity,
    // Kept as `category` (singular) for the top hit to match the spec's
    // example shape, plus `categories` (plural) for full detail.
    category: categories && categories.length > 0 ? categories[0] : null,
    categories: categories || [],
    blocked: Boolean(blocked),
    scanTimeMs
  };
}

module.exports = { buildEvent };
