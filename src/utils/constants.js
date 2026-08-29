"use strict";

/**
 * Threat category enum. String values are stable identifiers used in
 * ScanResult.categories, Finding.category, and log events — do not rename
 * without a major version bump.
 */
const CATEGORIES = Object.freeze({
  DIRECT_INJECTION: "PROMPT_INJECTION",
  SYSTEM_PROMPT_EXTRACTION: "SYSTEM_PROMPT_EXTRACTION",
  ROLE_MANIPULATION: "ROLE_MANIPULATION",
  JAILBREAK: "JAILBREAK",
  DATA_EXFILTRATION: "DATA_EXFILTRATION",
  OBFUSCATION: "OBFUSCATION",
  INDIRECT_INJECTION: "INDIRECT_INJECTION"
});

/** Severity buckets derived from a 0-100 risk score. */
const SEVERITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical"
});

/** How a finding was produced. Used for confidence weighting. */
const MATCH_TYPES = Object.freeze({
  PATTERN: "pattern",
  REGEX: "regex",
  HEURISTIC: "heuristic",
  OBFUSCATION: "obfuscation"
});

/** Max recursion depth when decoding nested obfuscation (anti decode-bomb). */
const MAX_DECODE_DEPTH = 2;

/** Default max prompt length (characters) the scanner will process. */
const DEFAULT_MAX_PROMPT_LENGTH = 20000;

module.exports = {
  CATEGORIES,
  SEVERITY,
  MATCH_TYPES,
  MAX_DECODE_DEPTH,
  DEFAULT_MAX_PROMPT_LENGTH
};
