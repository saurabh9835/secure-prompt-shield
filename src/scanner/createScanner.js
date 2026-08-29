"use strict";

const { scanPrompt, scanBatch } = require("./index");
const { resolveConfig } = require("../config/configValidator");

/**
 * Creates a scanner instance pre-bound to a resolved, validated config.
 * Recommended for high-throughput applications so config validation and
 * merging happens once at setup time rather than on every scan call.
 *
 * @param {object} [config]
 * @returns {{ scan: Function, scanBatch: Function, config: object }}
 */
function createScanner(config) {
  // Resolve + validate eagerly so misconfiguration fails at setup time.
  const resolved = resolveConfig(config);

  return {
    scan: (prompt) => scanPrompt(prompt, resolved),
    scanBatch: (prompts, opts) => scanBatch(prompts, { ...resolved, ...opts }),
    config: resolved
  };
}

module.exports = { createScanner };
