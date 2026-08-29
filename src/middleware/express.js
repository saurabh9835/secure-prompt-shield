"use strict";

const { createScanner } = require("../scanner/createScanner");
const { extractPrompt } = require("../utils/promptExtractor");

/**
 * Creates an Express middleware that scans req.body[config.promptField]
 * for prompt injection risk before the request reaches downstream
 * handlers.
 *
 * Behavior:
 *  - Attaches the full ScanResult to `req[config.attachKey]` (default
 *    `req.promptShield`) regardless of outcome, so handlers can always
 *    inspect it (e.g. to log riskScore even on allowed requests).
 *  - If no prompt is found at the configured field, the middleware calls
 *    next() immediately without scanning (nothing to scan) — this is NOT
 *    treated as an error or a block.
 *  - If `result.safe === false` and `config.blockHighRisk` is true,
 *    responds 403 with a minimal, non-revealing JSON body and does not
 *    call next().
 *  - Never sends matched text, rule IDs, or internal findings to the
 *    client — those stay in `req[config.attachKey]` for the app's own
 *    logging/handling.
 *
 * @param {object} [config] - see config/defaultConfig.js for all options
 * @returns {import('express').RequestHandler}
 */
function promptShield(config) {
  const scanner = createScanner(config);
  const attachKey = scanner.config.attachKey;

  return function promptShieldMiddleware(req, res, next) {
    const prompt = extractPrompt(req, scanner.config);

    if (prompt === null) {
      // Nothing to scan at the configured field — not an error condition.
      return next();
    }

    const result = scanner.scan(prompt);
    req[attachKey] = result;

    if (!result.safe && scanner.config.blockHighRisk) {
      return res.status(403).json({
        error: "Request blocked by secure-prompt-shield",
        severity: result.severity,
        riskScore: result.riskScore
      });
    }

    return next();
  };
}

module.exports = promptShield;
