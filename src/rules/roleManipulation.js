"use strict";

const { CATEGORIES } = require("../utils/constants");

/**
 * Attempts to convince the model it holds a different, more privileged
 * role (administrator, developer, "the system" itself) in order to bypass
 * behavioral constraints tied to its assistant role.
 */
const rules = [
  {
    id: "RM-001",
    category: CATEGORIES.ROLE_MANIPULATION,
    type: "pattern",
    value: "you are now the system",
    weight: 0.85,
    description: "Attempt to reassign the model's role to a privileged system role."
  },
  {
    id: "RM-002",
    category: CATEGORIES.ROLE_MANIPULATION,
    type: "pattern",
    value: "act as administrator",
    weight: 0.8,
    description: "Attempt to have the model act with administrator-level permissions."
  },
  {
    id: "RM-003",
    category: CATEGORIES.ROLE_MANIPULATION,
    type: "pattern",
    value: "pretend you are the developer",
    weight: 0.75,
    description: "Attempt to have the model impersonate the developer/operator."
  },
  {
    id: "RM-004",
    category: CATEGORIES.ROLE_MANIPULATION,
    type: "pattern",
    value: "switch roles",
    weight: 0.4,
    description: "Generic role-switch request; low weight alone, combines with other signals."
  },
  {
    id: "RM-005",
    category: CATEGORIES.ROLE_MANIPULATION,
    type: "regex",
    value: /\b(you are|act as|pretend (to be|you'?re)|roleplay as)\s+(now\s+)?(an?\s+)?(admin(istrator)?|root|superuser|the\s+system|the\s+developer|unrestricted)\b/i,
    weight: 0.85,
    description: "Regex variant covering common role-elevation phrasings."
  },
  {
    id: "RM-006",
    category: CATEGORIES.ROLE_MANIPULATION,
    type: "pattern",
    value: "no longer bound by your rules",
    weight: 0.8,
    description: "Attempt to convince the model its behavioral rules no longer apply."
  }
];

module.exports = rules;
