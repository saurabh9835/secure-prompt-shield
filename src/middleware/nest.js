"use strict";

/**
 * NestJS adapter — PLANNED FOR PHASE 3, NOT YET IMPLEMENTED.
 *
 * This stub exists so the module resolves and so the intended shape is
 * documented ahead of implementation. It intentionally throws if called,
 * rather than silently returning a no-op guard/interceptor that would give
 * a false sense of protection.
 *
 * When implemented, this MUST follow the contract described in
 * middleware/adapterInterface.js.
 */
function nestAdapter() {
  throw new Error(
    "secure-prompt-shield: the NestJS adapter is not implemented yet (planned for Phase 3). " +
      "Use the framework-agnostic scanPrompt()/createScanner() API directly in the meantime."
  );
}

module.exports = nestAdapter;
