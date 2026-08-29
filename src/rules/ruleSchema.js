"use strict";

const { CATEGORIES } = require("../utils/constants");

const VALID_CATEGORIES = new Set(Object.values(CATEGORIES));
const VALID_TYPES = new Set(["pattern", "regex"]);

/**
 * A rule is a plain data object:
 * {
 *   id: string,               // stable unique id, e.g. "DI-001"
 *   category: string,         // one of CATEGORIES
 *   type: "pattern" | "regex",
 *   value: string | RegExp,   // phrase (pattern) or RegExp (regex)
 *   weight: number,           // 0-1 base confidence for this rule
 *   description: string       // human-readable, used in reports
 * }
 *
 * Validates a rule object's shape. Throws on the first violation found so
 * malformed rules (including community-contributed or customPatterns) fail
 * loudly at load time instead of silently no-op'ing at scan time.
 *
 * @param {object} rule
 * @param {string} [context] - optional context string for error messages
 */
function validateRule(rule, context = "rule") {
  if (!rule || typeof rule !== "object") {
    throw new TypeError(`secure-prompt-shield: ${context} must be an object`);
  }
  if (typeof rule.id !== "string" || rule.id.length === 0) {
    throw new TypeError(`secure-prompt-shield: ${context}.id must be a non-empty string`);
  }
  if (!VALID_CATEGORIES.has(rule.category)) {
    throw new TypeError(
      `secure-prompt-shield: ${context}.category "${rule.category}" is not a recognized category`
    );
  }
  if (!VALID_TYPES.has(rule.type)) {
    throw new TypeError(`secure-prompt-shield: ${context}.type must be "pattern" or "regex"`);
  }
  if (rule.type === "pattern" && typeof rule.value !== "string") {
    throw new TypeError(`secure-prompt-shield: ${context}.value must be a string when type is "pattern"`);
  }
  if (rule.type === "regex" && !(rule.value instanceof RegExp)) {
    throw new TypeError(`secure-prompt-shield: ${context}.value must be a RegExp when type is "regex"`);
  }
  if (typeof rule.weight !== "number" || rule.weight < 0 || rule.weight > 1) {
    throw new RangeError(`secure-prompt-shield: ${context}.weight must be a number between 0 and 1`);
  }
  if (typeof rule.description !== "string" || rule.description.length === 0) {
    throw new TypeError(`secure-prompt-shield: ${context}.description must be a non-empty string`);
  }
  return true;
}

module.exports = { validateRule, VALID_CATEGORIES, VALID_TYPES };
