"use strict";

const { CATEGORIES } = require("../utils/constants");

/**
 * Signatures indicating the prompt is trying to smuggle instructions past
 * a filter using an encoding or splitting trick. These fire independently
 * of whether decoding succeeds (the obfuscation ENGINE handles decode +
 * rescan; these rules just flag the attempt/tell-tale phrasing itself).
 */
const rules = [
  {
    id: "OB-001",
    category: CATEGORIES.OBFUSCATION,
    type: "pattern",
    value: "decode this base64",
    weight: 0.6,
    description: "Explicit instruction referencing base64 decoding, often paired with a hidden payload."
  },
  {
    id: "OB-002",
    category: CATEGORIES.OBFUSCATION,
    type: "pattern",
    value: "decode this hex",
    weight: 0.6,
    description: "Explicit instruction referencing hex decoding, often paired with a hidden payload."
  },
  {
    id: "OB-003",
    category: CATEGORIES.OBFUSCATION,
    type: "regex",
    value: /\b([a-z]\s*[.\-_*]\s*){6,}[a-z]\b/i,
    weight: 0.4,
    description: 'Character-splitting obfuscation, e.g. "i.g.n.o.r.e" — letters separated by punctuation.'
  },
  {
    id: "OB-004",
    category: CATEGORIES.OBFUSCATION,
    type: "regex",
    value: /\\u[0-9a-fA-F]{4}/,
    weight: 0.45,
    description: "Literal unicode escape sequences embedded in prompt text, a common obfuscation vector."
  },
  {
    id: "OB-005",
    category: CATEGORIES.OBFUSCATION,
    type: "pattern",
    value: "rot13",
    weight: 0.45,
    description: "Reference to ROT13 or similar simple cipher, often used to smuggle instructions."
  }
];

module.exports = rules;
