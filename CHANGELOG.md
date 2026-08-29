# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

Nothing yet.

## [0.1.0] - 2026-08-29

### Added
- Core framework-agnostic scanning API: `scanPrompt`, `scanBatch`, `createScanner`
- Detection engines: pattern matching, regex matching, heuristic (structural/contextual) scoring, and obfuscation decoding (base64/hex, recursive rescan with capped depth)
- Built-in rule sets for all 7 threat categories: direct prompt injection, system prompt extraction, role manipulation, jailbreak attempts, data exfiltration, obfuscation techniques, indirect prompt injection indicators
- `customPatterns` support for adding organization-specific detection rules
- Risk scoring engine (0–100) with diminishing returns per category and a multi-category co-occurrence bonus
- Severity mapping (low/medium/high/critical) per the documented score bands
- Report generator producing human-readable findings, explanations, and recommendations, with matched-text redaction by default
- Logging layer with console, JSON, and file sinks, plus support for a custom logging function; logging failures never propagate into the request path
- Express middleware (`promptShield()`) with configurable prompt field extraction (dot-notation supported), configurable attach key, and configurable blocking behavior
- Config validation with sensible defaults and fail-fast error messages
- Fail-open / fail-closed configuration via `blockOnError`
- Documented (but unimplemented) adapter stubs for Fastify, Koa, and NestJS, each throwing a clear "not yet implemented" error rather than silently no-op'ing
- Full test suite: unit tests per engine/scoring/reporting/config/rules module, Express middleware tests, a malicious-prompt security corpus, a benign-prompt false-positive regression corpus, and a ReDoS audit across all built-in regex rules
- Documentation: README, SECURITY.md, CONTRIBUTING.md

### Known limitations
- Fastify, Koa, NestJS, Hono, and Next.js adapters are not yet implemented (planned for Phase 3)
- `scanBatch`'s `concurrency` option controls chunking, not true parallel execution (scanning is synchronous CPU work)
- Obfuscation decoding is capped at 2 levels of recursion

[Unreleased]: https://github.com/<your-org>/secure-prompt-shield/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/<your-org>/secure-prompt-shield/releases/tag/v0.1.0
