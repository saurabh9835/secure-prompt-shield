"use strict";

const { CATEGORIES, MATCH_TYPES } = require("../utils/constants");

/**
 * Base severity weight per category (0-1). Reflects how dangerous a
 * confirmed match in that category typically is, independent of how it
 * was detected.
 */
const CATEGORY_WEIGHTS = Object.freeze({
  [CATEGORIES.DIRECT_INJECTION]: 0.85,
  [CATEGORIES.SYSTEM_PROMPT_EXTRACTION]: 0.8,
  [CATEGORIES.ROLE_MANIPULATION]: 0.75,
  [CATEGORIES.JAILBREAK]: 0.9,
  [CATEGORIES.DATA_EXFILTRATION]: 0.95,
  [CATEGORIES.OBFUSCATION]: 0.6,
  [CATEGORIES.INDIRECT_INJECTION]: 0.65
});

/**
 * Confidence multiplier per detection method. Exact phrase matches are
 * trusted more than heuristic signals, which are inherently fuzzier.
 */
const MATCH_TYPE_WEIGHTS = Object.freeze({
  [MATCH_TYPES.PATTERN]: 1.0,
  [MATCH_TYPES.REGEX]: 0.95,
  [MATCH_TYPES.OBFUSCATION]: 0.85,
  [MATCH_TYPES.HEURISTIC]: 0.7
});

module.exports = { CATEGORY_WEIGHTS, MATCH_TYPE_WEIGHTS };
