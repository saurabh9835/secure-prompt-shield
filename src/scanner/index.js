"use strict";

const { normalize } = require("../utils/textNormalizer");
const { getActiveRules } = require("../rules");
const { runPatternEngine } = require("../engines/patternEngine");
const { runRegexEngine } = require("../engines/regexEngine");
const { runHeuristicEngine } = require("../engines/heuristicEngine");
const { runObfuscationEngine } = require("../engines/obfuscationEngine");
const { scoreAndSeverity } = require("../scoring/riskEngine");
const { generateReport } = require("../reporting/reportGenerator");
const { logEvent } = require("../logging/logger");
const { resolveConfig } = require("../config/configValidator");

const PACKAGE_VERSION = "0.1.0";

/**
 * Core, framework-agnostic scan function. Runs the configured engines
 * against a single prompt string and returns a fully-formed ScanResult.
 * Never throws for "normal" bad/malicious input — only throws for
 * programmer errors (invalid config, non-string prompt where a string is
 * required at the public API boundary is instead handled gracefully, see
 * below).
 *
 * @param {string} prompt
 * @param {object} [userConfig]
 * @returns {ScanResult}
 */
function scanPrompt(prompt, userConfig) {
  const config = resolveConfig(userConfig);
  const startedAt = Date.now();

  // Non-string or empty prompts are treated as trivially safe rather than
  // errors — callers may legitimately scan optional/empty fields.
  if (typeof prompt !== "string" || prompt.length === 0) {
    return buildEmptyResult(startedAt);
  }

  const truncated = prompt.length > config.maxPromptLength;
  const workingPrompt = truncated ? prompt.slice(0, config.maxPromptLength) : prompt;

  try {
    const rules = getActiveRules(config.customPatterns);
    const normalizedText = normalize(workingPrompt);

    const allFindings = [];

    if (config.enablePatternEngine) {
      allFindings.push(...runPatternEngine(normalizedText, rules));
    }
    if (config.enableRegexEngine) {
      allFindings.push(...runRegexEngine(normalizedText, rules));
    }

    let decodedPayloadDetected = false;
    if (config.enableObfuscationDecoding) {
      const obfResult = runObfuscationEngine(workingPrompt, rules);
      allFindings.push(...obfResult.findings);
      decodedPayloadDetected = obfResult.decodedPayloadDetected;
    }

    if (config.enableHeuristics) {
      allFindings.push(...runHeuristicEngine(normalizedText, allFindings));
    }

    const { riskScore, severity } = scoreAndSeverity(allFindings);
    const { findings, recommendations, categories } = generateReport(allFindings, severity, {
      redactMatchedText: config.redactMatchedTextInLogs
    });

    const scanTimeMs = Date.now() - startedAt;
    const safe = riskScore < config.threshold;

    const result = {
      safe,
      riskScore,
      severity,
      categories,
      findings,
      recommendations: truncated
        ? [...recommendations, `Prompt was truncated to ${config.maxPromptLength} characters before scanning.`]
        : recommendations,
      meta: {
        scanTimeMs,
        engineVersion: PACKAGE_VERSION,
        decodedPayloadDetected,
        truncated
      }
    };

    logEvent(
      {
        riskScore,
        severity,
        categories,
        blocked: !safe && config.blockHighRisk,
        scanTimeMs
      },
      config
    );

    return result;
  } catch (err) {
    if (config.blockOnError) {
      // Fail closed: report as maximally unsafe so calling middleware blocks.
      return {
        safe: false,
        riskScore: 100,
        severity: "critical",
        categories: [],
        findings: [],
        recommendations: [
          "The scanner encountered an internal error and blockOnError is enabled; request was treated as unsafe.",
          `Internal error: ${err.message}`
        ],
        meta: {
          scanTimeMs: Date.now() - startedAt,
          engineVersion: PACKAGE_VERSION,
          decodedPayloadDetected: false,
          truncated,
          error: true
        }
      };
    }

    // Fail open (default): report as safe but surface the error in meta so
    // the app can choose to log/alert on it. This default favors
    // availability; teams with stricter needs should set blockOnError: true.
    return {
      safe: true,
      riskScore: 0,
      severity: "low",
      categories: [],
      findings: [],
      recommendations: [
        "The scanner encountered an internal error and blockOnError is disabled; request was allowed through.",
        `Internal error: ${err.message}`
      ],
      meta: {
        scanTimeMs: Date.now() - startedAt,
        engineVersion: PACKAGE_VERSION,
        decodedPayloadDetected: false,
        truncated,
        error: true
      }
    };
  }
}

/**
 * @param {number} startedAt
 * @returns {ScanResult}
 */
function buildEmptyResult(startedAt) {
  return {
    safe: true,
    riskScore: 0,
    severity: "low",
    categories: [],
    findings: [],
    recommendations: [],
    meta: {
      scanTimeMs: Date.now() - startedAt,
      engineVersion: PACKAGE_VERSION,
      decodedPayloadDetected: false,
      truncated: false
    }
  };
}

/**
 * Scans multiple prompts. Sequential by default; pass { concurrency: n }
 * to process in parallel batches via Promise.all chunking.
 *
 * @param {string[]} prompts
 * @param {object} [userConfig] - same as scanPrompt, plus optional `concurrency`
 * @returns {ScanResult[]}
 */
function scanBatch(prompts, userConfig = {}) {
  if (!Array.isArray(prompts)) {
    throw new TypeError("secure-prompt-shield: scanBatch expects an array of prompts");
  }

  const { concurrency, ...scanConfig } = userConfig;

  if (!concurrency || concurrency <= 1) {
    return prompts.map((p) => scanPrompt(p, scanConfig));
  }

  // Simple synchronous chunking; scanPrompt is CPU-bound and synchronous,
  // so "concurrency" here mainly controls batch grouping for callers that
  // want to interleave with other async work between chunks, rather than
  // true parallel execution (Node is single-threaded for this CPU work).
  const results = [];
  for (let i = 0; i < prompts.length; i += concurrency) {
    const chunk = prompts.slice(i, i + concurrency);
    results.push(...chunk.map((p) => scanPrompt(p, scanConfig)));
  }
  return results;
}

module.exports = { scanPrompt, scanBatch };
