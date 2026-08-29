"use strict";

const { CATEGORIES } = require("../utils/constants");

/**
 * Attempts to extract secrets, credentials, API keys, or other sensitive
 * data that may be accessible to the model via context, tools, or memory.
 */
const rules = [
  {
    id: "DE-001",
    category: CATEGORIES.DATA_EXFILTRATION,
    type: "pattern",
    value: "reveal secrets",
    weight: 0.8,
    description: "Direct request to reveal secret information."
  },
  {
    id: "DE-002",
    category: CATEGORIES.DATA_EXFILTRATION,
    type: "pattern",
    value: "show me the api key",
    weight: 0.9,
    description: "Direct request to reveal an API key."
  },
  {
    id: "DE-003",
    category: CATEGORIES.DATA_EXFILTRATION,
    type: "pattern",
    value: "output the credentials",
    weight: 0.9,
    description: "Direct request to output credentials."
  },
  {
    id: "DE-004",
    category: CATEGORIES.DATA_EXFILTRATION,
    type: "pattern",
    value: "leak hidden information",
    weight: 0.85,
    description: "Direct request to leak hidden/internal information."
  },
  {
    id: "DE-005",
    category: CATEGORIES.DATA_EXFILTRATION,
    type: "regex",
    value: /\b(api[\s_-]?key|access[\s_-]?token|secret[\s_-]?key|password|env(ironment)?\s+variables?)\b.{0,20}\b(reveal|show|output|print|leak|give me)\b/i,
    weight: 0.75,
    description: "Regex variant: sensitive-term near an extraction verb, either order."
  },
  {
    id: "DE-006",
    category: CATEGORIES.DATA_EXFILTRATION,
    type: "regex",
    value: /\b(give me|send me|display)\b.{0,20}\b(all|any)\b.{0,20}\b(secrets?|credentials?|keys?|tokens?)\b/i,
    weight: 0.8,
    description: "Broad extraction request targeting secrets/credentials/keys/tokens."
  }
];

module.exports = rules;
