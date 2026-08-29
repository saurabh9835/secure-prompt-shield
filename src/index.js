"use strict";

const { scanPrompt, scanBatch } = require("./scanner");
const { createScanner } = require("./scanner/createScanner");
const promptShield = require("./middleware/express");

module.exports = {
  // Core, framework-agnostic API
  scanPrompt,
  scanBatch,
  createScanner,

  // Express middleware
  promptShield
};
