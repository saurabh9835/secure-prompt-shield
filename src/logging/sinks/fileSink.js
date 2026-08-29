"use strict";

const fs = require("fs");

/**
 * Appends a security event as a JSON line to a configured file path.
 * Fire-and-forget (async, non-blocking) — a logging failure must never
 * throw back into the request path. Errors are swallowed after a single
 * console.error so silent total logging failure is at least discoverable
 * in local development, without risking crashing the host app.
 *
 * @param {object} event - see logging/eventSchema.js
 * @param {string} filePath
 */
function fileSink(event, filePath) {
  const line = `${JSON.stringify(event)}\n`;
  fs.appendFile(filePath, line, (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(`[secure-prompt-shield] failed to write log file (${filePath}):`, err.message);
    }
  });
}

module.exports = fileSink;
