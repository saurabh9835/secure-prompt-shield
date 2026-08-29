"use strict";

const { defaultConfig } = require("./defaultConfig");

const VALID_LOG_SINKS = new Set(["console", "json", "file"]);

/**
 * Merges a user-supplied partial config with defaults and validates types.
 * Throws a descriptive Error on invalid input — fail fast at setup time
 * rather than silently misbehaving at scan time.
 *
 * @param {object} [userConfig]
 * @returns {object} fully resolved, frozen config
 */
function resolveConfig(userConfig = {}) {
  if (userConfig !== null && typeof userConfig !== "object") {
    throw new TypeError("secure-prompt-shield: config must be an object");
  }

  const merged = { ...defaultConfig, ...userConfig };

  if (typeof merged.threshold !== "number" || merged.threshold < 0 || merged.threshold > 100) {
    throw new RangeError("secure-prompt-shield: config.threshold must be a number between 0 and 100");
  }

  if (typeof merged.blockHighRisk !== "boolean") {
    throw new TypeError("secure-prompt-shield: config.blockHighRisk must be a boolean");
  }

  if (typeof merged.blockOnError !== "boolean") {
    throw new TypeError("secure-prompt-shield: config.blockOnError must be a boolean");
  }

  for (const flag of [
    "enablePatternEngine",
    "enableRegexEngine",
    "enableHeuristics",
    "enableObfuscationDecoding",
    "logEvents",
    "redactMatchedTextInLogs"
  ]) {
    if (typeof merged[flag] !== "boolean") {
      throw new TypeError(`secure-prompt-shield: config.${flag} must be a boolean`);
    }
  }

  if (!Array.isArray(merged.customPatterns)) {
    throw new TypeError("secure-prompt-shield: config.customPatterns must be an array");
  }

  if (typeof merged.maxPromptLength !== "number" || merged.maxPromptLength <= 0) {
    throw new RangeError("secure-prompt-shield: config.maxPromptLength must be a positive number");
  }

  if (
    typeof merged.logSink !== "function" &&
    !VALID_LOG_SINKS.has(merged.logSink)
  ) {
    throw new TypeError(
      `secure-prompt-shield: config.logSink must be one of ${[...VALID_LOG_SINKS].join(
        ", "
      )} or a function`
    );
  }

  if (typeof merged.promptField !== "string" || merged.promptField.length === 0) {
    throw new TypeError("secure-prompt-shield: config.promptField must be a non-empty string");
  }

  if (typeof merged.attachKey !== "string" || merged.attachKey.length === 0) {
    throw new TypeError("secure-prompt-shield: config.attachKey must be a non-empty string");
  }

  return Object.freeze(merged);
}

module.exports = { resolveConfig };
