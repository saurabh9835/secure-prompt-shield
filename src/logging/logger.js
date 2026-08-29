"use strict";

const { buildEvent } = require("./eventSchema");
const consoleSink = require("./sinks/consoleSink");
const jsonSink = require("./sinks/jsonSink");
const fileSink = require("./sinks/fileSink");

/**
 * Dispatches a security event to the configured sink. Logging is
 * best-effort and MUST NOT throw back into the caller's request path —
 * any sink error is caught and swallowed after a console.error, since a
 * broken log pipe should never take down prompt scanning.
 *
 * @param {object} scanContext - { riskScore, severity, categories, blocked, scanTimeMs }
 * @param {object} config - resolved config (logSink, logFilePath, logEvents)
 */
function logEvent(scanContext, config) {
  if (!config || !config.logEvents) return;

  const event = buildEvent(scanContext);

  try {
    if (typeof config.logSink === "function") {
      config.logSink(event);
      return;
    }

    switch (config.logSink) {
      case "json":
        jsonSink(event);
        break;
      case "file":
        fileSink(event, config.logFilePath);
        break;
      case "console":
      default:
        consoleSink(event);
        break;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[secure-prompt-shield] logging sink threw an error:", err.message);
  }
}

module.exports = { logEvent };
