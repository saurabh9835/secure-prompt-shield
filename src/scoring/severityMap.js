"use strict";

const { SEVERITY } = require("../utils/constants");

/**
 * Score bands:
 *   0-30   -> low
 *   31-60  -> medium
 *   61-80  -> high
 *   81-100 -> critical
 *
 * @param {number} score - 0-100
 * @returns {string} one of SEVERITY values
 */
function scoreToSeverity(score) {
  if (score <= 30) return SEVERITY.LOW;
  if (score <= 60) return SEVERITY.MEDIUM;
  if (score <= 80) return SEVERITY.HIGH;
  return SEVERITY.CRITICAL;
}

module.exports = { scoreToSeverity };
