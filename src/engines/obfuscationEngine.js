"use strict";

const { findEncodedCandidates } = require("../utils/encodingDetector");
const { normalize } = require("../utils/textNormalizer");
const { runPatternEngine } = require("./patternEngine");
const { runRegexEngine } = require("./regexEngine");
const { CATEGORIES, MATCH_TYPES, MAX_DECODE_DEPTH } = require("../utils/constants");

/**
 * Attempts to base64-decode a candidate string. Returns null if it doesn't
 * decode to plausible printable text (i.e. it was probably not actually
 * base64, just an incidentally base64-alphabet-shaped token).
 *
 * @param {string} candidate
 * @returns {string|null}
 */
function tryDecodeBase64(candidate) {
  try {
    const decoded = Buffer.from(candidate, "base64").toString("utf8");
    // Heuristic plausibility check: mostly printable characters.
    const printableRatio =
      decoded.length === 0
        ? 0
        : decoded.split("").filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length /
          decoded.length;
    return printableRatio > 0.85 && decoded.trim().length > 0 ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Attempts to hex-decode a candidate string, with the same plausibility
 * check as base64 decoding.
 *
 * @param {string} candidate
 * @returns {string|null}
 */
function tryDecodeHex(candidate) {
  try {
    if (candidate.length % 2 !== 0) return null;
    const decoded = Buffer.from(candidate, "hex").toString("utf8");
    const printableRatio =
      decoded.length === 0
        ? 0
        : decoded.split("").filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length /
          decoded.length;
    return printableRatio > 0.85 && decoded.trim().length > 0 ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Detects encoded payloads, decodes plausible ones, and re-runs the
 * pattern + regex engines against the decoded text. Recurses up to
 * MAX_DECODE_DEPTH to catch nested encoding while capping work done on
 * adversarial "decode bomb" inputs.
 *
 * @param {string} originalText - original (non-normalized) prompt text
 * @param {Array} rules - full active rule set (pattern + regex rules)
 * @param {number} [depth]
 * @returns {{ findings: Array<Finding>, decodedPayloadDetected: boolean }}
 */
function runObfuscationEngine(originalText, rules, depth = 0) {
  const findings = [];
  let decodedPayloadDetected = false;

  if (!originalText || depth >= MAX_DECODE_DEPTH) {
    return { findings, decodedPayloadDetected };
  }

  const { base64, hex } = findEncodedCandidates(originalText);
  const decodedTexts = [];

  for (const candidate of base64) {
    const decoded = tryDecodeBase64(candidate);
    if (decoded) {
      decodedPayloadDetected = true;
      decodedTexts.push(decoded);
      findings.push({
        category: CATEGORIES.OBFUSCATION,
        ruleId: "OBF-ENGINE-B64",
        matchType: MATCH_TYPES.OBFUSCATION,
        matchedText: candidate.slice(0, 40),
        confidence: 0.55
      });
    }
  }

  for (const candidate of hex) {
    const decoded = tryDecodeHex(candidate);
    if (decoded) {
      decodedPayloadDetected = true;
      decodedTexts.push(decoded);
      findings.push({
        category: CATEGORIES.OBFUSCATION,
        ruleId: "OBF-ENGINE-HEX",
        matchType: MATCH_TYPES.OBFUSCATION,
        matchedText: candidate.slice(0, 40),
        confidence: 0.5
      });
    }
  }

  // Re-scan decoded payloads with the pattern + regex engines, and recurse
  // in case the decoded text is itself encoded again.
  for (const decodedText of decodedTexts) {
    const normalizedDecoded = normalize(decodedText);
    findings.push(...runPatternEngine(normalizedDecoded, rules));
    findings.push(...runRegexEngine(normalizedDecoded, rules));

    const nested = runObfuscationEngine(decodedText, rules, depth + 1);
    findings.push(...nested.findings);
    decodedPayloadDetected = decodedPayloadDetected || nested.decodedPayloadDetected;
  }

  return { findings, decodedPayloadDetected };
}

module.exports = { runObfuscationEngine, tryDecodeBase64, tryDecodeHex };
