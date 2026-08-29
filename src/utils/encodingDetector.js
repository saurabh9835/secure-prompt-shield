"use strict";

// A base64 "word" worth flagging: reasonably long, valid alphabet, optional padding.
const BASE64_CANDIDATE = /\b[A-Za-z0-9+/]{24,}={0,2}\b/g;

// A hex "word" worth flagging: long run of hex digits (even length).
const HEX_CANDIDATE = /\b(?:[0-9a-fA-F]{2}){12,}\b/g;

/**
 * Scans text for substrings that look like base64 or hex encoded payloads.
 * This is intentionally permissive (favors recall) — the obfuscation engine
 * attempts to decode candidates and only keeps ones that decode to plausible
 * text, so false positives here are cheap.
 *
 * @param {string} text - original (non-lowercased) text, encoding is case-sensitive
 * @returns {{ base64: string[], hex: string[] }}
 */
function findEncodedCandidates(text) {
  if (typeof text !== "string" || text.length === 0) {
    return { base64: [], hex: [] };
  }

  const base64 = Array.from(text.matchAll(BASE64_CANDIDATE), (m) => m[0]);
  const hex = Array.from(text.matchAll(HEX_CANDIDATE), (m) => m[0]);

  return { base64, hex };
}

module.exports = { findEncodedCandidates };
