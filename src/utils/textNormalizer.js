"use strict";

/**
 * Normalizes raw prompt text into a canonical working form for detection.
 * The ORIGINAL text is always preserved by the caller for display purposes;
 * this function only produces the buffer that engines scan against.
 *
 * Steps:
 *  1. Unicode NFKC normalization (collapses many homoglyph / fullwidth tricks)
 *  2. Strip zero-width and other invisible formatting characters often used
 *     to break up trigger phrases (e.g. "i\u200bgnore")
 *  3. Collapse repeated whitespace
 *  4. Lowercase (case-insensitive matching is the default; engines that need
 *     case-sensitive checks should use the original text passed alongside)
 *
 * @param {string} text
 * @returns {string} normalized text
 */
function normalize(text) {
  if (typeof text !== "string") return "";

  let out = text.normalize("NFKC");

  // Strip zero-width characters and other invisible formatting marks
  // commonly used to break up detectable phrases.
  out = out.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, "");

  // Collapse whitespace runs (including newlines/tabs) to a single space,
  // but keep a boundary marker so word-boundary regexes still work.
  out = out.replace(/\s+/g, " ").trim();

  return out.toLowerCase();
}

module.exports = { normalize };
