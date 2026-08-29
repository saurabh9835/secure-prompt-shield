"use strict";

/**
 * Writes a security event as a single-line JSON object to stdout — suitable
 * for log aggregators (e.g. CloudWatch, Datadog, ELK) that parse JSON lines.
 *
 * @param {object} event - see logging/eventSchema.js
 */
function jsonSink(event) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(event));
}

module.exports = jsonSink;
