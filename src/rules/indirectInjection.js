"use strict";

const { CATEGORIES } = require("../utils/constants");

/**
 * Indicators that a prompt contains or references content designed to be
 * interpreted as instructions when pulled into a model's context indirectly
 * (e.g. via a fetched document, webpage, or tool output) rather than typed
 * directly by the end user. These are inherently fuzzier / lower-confidence
 * signals — they flag STRUCTURE, not necessarily malicious intent.
 */
const rules = [
  {
    id: "II-001",
    category: CATEGORIES.INDIRECT_INJECTION,
    type: "pattern",
    value: "hidden instructions",
    weight: 0.5,
    description: 'Explicit reference to "hidden instructions", often used to describe or invoke embedded commands.'
  },
  {
    id: "II-002",
    category: CATEGORIES.INDIRECT_INJECTION,
    type: "pattern",
    value: "embedded commands",
    weight: 0.5,
    description: "Explicit reference to commands embedded within content."
  },
  {
    id: "II-003",
    category: CATEGORIES.INDIRECT_INJECTION,
    type: "regex",
    value: /\[\s*(system|instruction|admin)\s*\]/i,
    weight: 0.55,
    description: 'Bracketed pseudo-role markers (e.g. "[SYSTEM]") often used to fake an instruction block inside document content.'
  },
  {
    id: "II-004",
    category: CATEGORIES.INDIRECT_INJECTION,
    type: "regex",
    value: /<\s*(system|instructions?)\s*>/i,
    weight: 0.55,
    description: "Pseudo-XML instruction tags embedded in content to mimic system-level markup."
  },
  {
    id: "II-005",
    category: CATEGORIES.INDIRECT_INJECTION,
    type: "regex",
    value: /\bhttps?:\/\/\S+\b.{0,30}\b(instructions?|prompt|payload)\b/i,
    weight: 0.4,
    description: "Suspicious URL paired with instruction-referencing language nearby, a common indirect-injection delivery pattern."
  },
  {
    id: "II-006",
    category: CATEGORIES.INDIRECT_INJECTION,
    type: "pattern",
    value: "when you read this, do the following",
    weight: 0.6,
    description: "Conditional-trigger phrasing typical of content designed to inject instructions when parsed."
  }
];

module.exports = rules;
