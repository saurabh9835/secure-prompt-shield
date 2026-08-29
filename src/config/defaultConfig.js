"use strict";

const { DEFAULT_MAX_PROMPT_LENGTH } = require("../utils/constants");

/**
 * Default configuration for the scanner and middleware.
 * Every field here can be overridden by the caller. See docs/API.md for
 * a full description of each option.
 */
const defaultConfig = Object.freeze({
  // Scoring / blocking
  threshold: 70,
  blockHighRisk: true,
  blockOnError: false,

  // Engines
  enablePatternEngine: true,
  enableRegexEngine: true,
  enableHeuristics: true,
  enableObfuscationDecoding: true,

  // Custom rules (see rules/ruleSchema.js for shape)
  customPatterns: [],

  // Limits
  maxPromptLength: DEFAULT_MAX_PROMPT_LENGTH,

  // Logging
  logEvents: true,
  logSink: "console", // "console" | "json" | "file" | function
  redactMatchedTextInLogs: true,
  logFilePath: "./prompt-shield.log", // used only when logSink === "file"

  // Middleware / extraction
  promptField: "prompt",
  attachKey: "promptShield"
});

module.exports = { defaultConfig };
