"use strict";

/**
 * ADAPTER INTERFACE CONTRACT (documentation only, not an executable base
 * class — kept deliberately simple since JS has no interfaces).
 *
 * Every framework adapter (express.js, fastify.js, koa.js, nest.js, ...)
 * MUST:
 *
 * 1. Accept the same config object shape as promptShield()/createScanner().
 * 2. Use utils/promptExtractor.js (or an equivalent per-framework request
 *    reader) to pull the prompt string out of the framework's request
 *    object using config.promptField.
 * 3. Call a scanner created via scanner/createScanner.js — never call the
 *    detection engines directly. The adapter's only job is request/response
 *    plumbing.
 * 4. Attach the full ScanResult to the request/context object under
 *    config.attachKey (default "promptShield"), so downstream handlers can
 *    inspect it even when the request was not blocked.
 * 5. When result.safe === false AND config.blockHighRisk === true, short-
 *    circuit the request/response cycle with an appropriate "blocked"
 *    response for that framework (e.g. Express: res.status(403).json(...),
 *    Fastify: reply.code(403).send(...)), and must NOT call the downstream
 *    handler/next().
 * 6. Never leak internal rule details, matched text, or stack traces in the
 *    blocked response body sent to the client — that information belongs
 *    in findings/logs only, accessible to the application developer, not
 *    the end user who may be the attacker.
 * 7. Respect config.blockOnError as resolved by the scanner itself; the
 *    adapter should not add its own separate error-handling policy.
 *
 * This file intentionally exports nothing executable — it exists as a
 * living reference for Phase 3 adapter implementations (Fastify, Koa,
 * NestJS, Hono, Next.js) so they stay consistent with the Express adapter.
 */

module.exports = {};
