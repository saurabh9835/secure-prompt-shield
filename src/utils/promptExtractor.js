"use strict";

/**
 * Resolves a (possibly dotted) field path against an object.
 * Supports simple dot-notation only (e.g. "message.content").
 * Array indices are NOT supported in v1 — documented limitation.
 *
 * @param {object} obj
 * @param {string} path
 * @returns {*} resolved value or undefined
 */
function resolvePath(obj, path) {
  if (!obj || typeof path !== "string") return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return acc[key];
    return undefined;
  }, obj);
}

/**
 * Extracts the prompt string from an Express request body based on config.
 *
 * @param {import('express').Request} req
 * @param {{ promptField: string }} config
 * @returns {string|null} the extracted prompt, or null if not found/not a string
 */
function extractPrompt(req, config) {
  const body = req && req.body;
  if (!body || typeof body !== "object") return null;

  const field = (config && config.promptField) || "prompt";
  const value = resolvePath(body, field);

  return typeof value === "string" ? value : null;
}

module.exports = { extractPrompt, resolvePath };
