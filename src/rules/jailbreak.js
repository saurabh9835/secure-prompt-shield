"use strict";

const { CATEGORIES } = require("../utils/constants");

/**
 * Attempts to disable, bypass, or remove safety behavior directly, as
 * opposed to role manipulation (which tries to achieve the same thing
 * indirectly via a persona change).
 */
const rules = [
  {
    id: "JB-001",
    category: CATEGORIES.JAILBREAK,
    type: "pattern",
    value: "disable safety",
    weight: 0.85,
    description: "Direct request to disable safety behavior."
  },
  {
    id: "JB-002",
    category: CATEGORIES.JAILBREAK,
    type: "pattern",
    value: "ignore your policies",
    weight: 0.85,
    description: "Direct request to ignore usage policies."
  },
  {
    id: "JB-003",
    category: CATEGORIES.JAILBREAK,
    type: "pattern",
    value: "bypass restrictions",
    weight: 0.85,
    description: "Direct request to bypass restrictions/guardrails."
  },
  {
    id: "JB-004",
    category: CATEGORIES.JAILBREAK,
    type: "pattern",
    value: "remove safeguards",
    weight: 0.85,
    description: "Direct request to remove safety safeguards."
  },
  {
    id: "JB-005",
    category: CATEGORIES.JAILBREAK,
    type: "regex",
    value: /\b(dan|do anything now)\b/i,
    weight: 0.6,
    description: 'Reference to well-known jailbreak persona ("DAN"/"do anything now").'
  },
  {
    id: "JB-006",
    category: CATEGORIES.JAILBREAK,
    type: "regex",
    value: /\bwithout\s+(any\s+)?(restrictions?|limitations?|filters?|censorship)\b/i,
    weight: 0.7,
    description: 'Requests for output "without restrictions/filters/censorship".'
  },
  {
    id: "JB-007",
    category: CATEGORIES.JAILBREAK,
    type: "pattern",
    value: "no ethical guidelines",
    weight: 0.8,
    description: "Explicit request to operate without ethical guidelines."
  }
];

module.exports = rules;
