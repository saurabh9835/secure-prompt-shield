"use strict";

const { CATEGORIES, MATCH_TYPES } = require("../utils/constants");

/**
 * The heuristic engine looks at STRUCTURE and DENSITY rather than exact
 * phrases: how many imperative/instruction-like verbs appear, how many
 * distinct threat categories already fired from other engines, unusual
 * imperative density, and multi-instruction stacking. It runs last and can
 * see the findings already produced by the other engines so it can reason
 * about combinations (e.g. "role manipulation" + "extraction" together is
 * a stronger signal than either alone).
 *
 * Each heuristic below produces at most one finding per prompt with a
 * synthetic ruleId (HEU-xxx) so it participates in scoring like any other
 * finding, but is clearly distinguishable in reports/logs as engine-derived
 * rather than rule-derived.
 *
 * @param {string} normalizedText
 * @param {Array<object>} priorFindings - findings already produced by
 *   pattern/regex/obfuscation engines for this scan
 * @returns {Array<Finding>}
 */
function runHeuristicEngine(normalizedText, priorFindings = []) {
  const findings = [];
  if (!normalizedText) return findings;

  // --- Heuristic 1: imperative instruction density -----------------------
  // Counts common imperative "command" verbs often used to steer/override
  // model behavior. A high density in a short prompt is suspicious even if
  // no single exact phrase matched.
  const imperativeVerbs = [
    "ignore", "disregard", "forget", "override", "bypass", "disable",
    "reveal", "print", "output", "show", "act", "pretend", "become",
    "switch", "unlock", "enable", "remove"
  ];
  const words = normalizedText.split(/\s+/).filter(Boolean);
  const imperativeHits = words.filter((w) => imperativeVerbs.includes(w)).length;
  const density = words.length > 0 ? imperativeHits / words.length : 0;

  if (imperativeHits >= 3 && density > 0.06) {
    findings.push({
      category: CATEGORIES.DIRECT_INJECTION,
      ruleId: "HEU-DENSITY-001",
      matchType: MATCH_TYPES.HEURISTIC,
      matchedText: `${imperativeHits} imperative instruction verbs`,
      confidence: Math.min(0.6, 0.3 + density)
    });
  }

  // --- Heuristic 2: multi-category stacking -------------------------------
  // If findings from OTHER engines already span 2+ distinct categories,
  // that combination itself is an aggravating signal (a single "jailbreak"
  // phrase is concerning; jailbreak + extraction together in one prompt is
  // more concerning than the sum of two isolated matches).
  const distinctCategories = new Set(priorFindings.map((f) => f.category));
  if (distinctCategories.size >= 2) {
    findings.push({
      category: CATEGORIES.JAILBREAK,
      ruleId: "HEU-STACK-001",
      matchType: MATCH_TYPES.HEURISTIC,
      matchedText: `${distinctCategories.size} distinct threat categories co-occurring`,
      confidence: Math.min(0.4, 0.15 * distinctCategories.size)
    });
  }

  // --- Heuristic 3: instruction-block mimicry -----------------------------
  // Looks for colon-terminated "label:" scaffolding that mimics a system/
  // instruction block structure (e.g. "system:", "rules:", "instructions:")
  // appearing mid-prompt rather than as the whole message, which often
  // signals an attempt to inject a fake instruction section.
  const scaffoldPattern = /\b(system|rules|instructions|admin|developer)\s*:/g;
  const scaffoldMatches = normalizedText.match(scaffoldPattern);
  if (scaffoldMatches && scaffoldMatches.length > 0) {
    findings.push({
      category: CATEGORIES.INDIRECT_INJECTION,
      ruleId: "HEU-SCAFFOLD-001",
      matchType: MATCH_TYPES.HEURISTIC,
      matchedText: scaffoldMatches[0],
      confidence: 0.35
    });
  }

  return findings;
}

module.exports = { runHeuristicEngine };
