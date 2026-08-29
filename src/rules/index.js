"use strict";

const { validateRule } = require("./ruleSchema");

const directInjection = require("./directInjection");
const systemPromptExtraction = require("./systemPromptExtraction");
const roleManipulation = require("./roleManipulation");
const jailbreak = require("./jailbreak");
const dataExfiltration = require("./dataExfiltration");
const obfuscation = require("./obfuscation");
const indirectInjection = require("./indirectInjection");

const BUILTIN_RULES = [
  ...directInjection,
  ...systemPromptExtraction,
  ...roleManipulation,
  ...jailbreak,
  ...dataExfiltration,
  ...obfuscation,
  ...indirectInjection
];

// Validate built-in rules once at module load time. This is a developer-facing
// safety net (catches typos/mistakes in this package's own rule files) and
// runs once per process, not per scan.
BUILTIN_RULES.forEach((rule, i) => validateRule(rule, `builtin rule[${i}] (${rule && rule.id})`));

/**
 * Returns the full active rule set: built-in rules plus any valid
 * customPatterns supplied via config. Invalid custom rules throw at
 * scanner-creation time (see configValidator/createScanner) rather than
 * being silently dropped.
 *
 * @param {Array} [customPatterns]
 * @returns {Array} combined, validated rule list
 */
function getActiveRules(customPatterns = []) {
  if (!Array.isArray(customPatterns) || customPatterns.length === 0) {
    return BUILTIN_RULES;
  }

  customPatterns.forEach((rule, i) => validateRule(rule, `customPatterns[${i}]`));

  // Custom rules are appended, not merged by id — an app author can still
  // effectively "override" a built-in by adding a higher-weight custom rule
  // targeting the same phrase; ids are namespaced by convention (built-ins
  // use short category prefixes like DI-, RM-, etc.) to avoid collisions.
  return [...BUILTIN_RULES, ...customPatterns];
}

module.exports = { getActiveRules, BUILTIN_RULES };
