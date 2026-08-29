"use strict";

/**
 * Writes a security event as a readable console line. Uses console.warn
 * for high/critical severity so it's visually distinct in most terminals,
 * console.log otherwise.
 *
 * @param {object} event - see logging/eventSchema.js
 */
function consoleSink(event) {
  const line = `[secure-prompt-shield] ${event.timestamp} risk=${event.riskScore} severity=${event.severity} category=${event.category} blocked=${event.blocked}`;
  if (event.severity === "high" || event.severity === "critical") {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

module.exports = consoleSink;
