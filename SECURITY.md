# Security Policy

## Reporting a vulnerability

If you find a way to bypass detection, a false-negative pattern, or any other security issue in `secure-prompt-shield` itself (e.g. a ReDoS-vulnerable regex, a decode-bomb that isn't capped, or a logic bug that weakens scoring), please report it privately rather than opening a public issue.

- **Preferred:** open a [GitHub Security Advisory](../../security/advisories/new) on this repository (private by default).
- **Alternative:** email the maintainer listed in `package.json` with subject line `[SECURITY] secure-prompt-shield`.

Please include:
- A description of the issue and why it matters
- A minimal reproduction (prompt input + config used)
- Your assessment of severity (using the package's own low/medium/high/critical bands is a fine reference point)

We aim to acknowledge reports within 5 business days. This is a solo-maintained open-source project — response times may vary, but security reports are prioritized over feature work.

**Please do not** disclose the issue publicly (including in a public GitHub issue) until a fix has been released, unless 90 days have passed with no response.

## Scope

In scope:
- Detection bypasses (a clearly malicious prompt that scores well below `threshold` with default config)
- ReDoS-vulnerable regex patterns in `src/rules/`
- Logic bugs in scoring, obfuscation decoding, or the Express middleware that weaken the security guarantees documented in the README
- Log injection or information disclosure issues in the logging layer

Out of scope:
- False positives (benign prompts flagged as unsafe) — please report these as a normal GitHub issue with the `false-positive` label instead, they help improve the ruleset but aren't a security vulnerability
- Vulnerabilities in the LLM provider you're using downstream of this package
- Issues in unimplemented framework adapters (Fastify/Koa/NestJS/Hono/Next.js) — these are documented stubs that throw on use

## Known limitations

Please read this section before relying on `secure-prompt-shield` for anything security-critical:

1. **This is a static, offline heuristic detector.** It cannot understand novel phrasing, multi-turn context, or attacks that don't rely on the specific phrase/structural patterns encoded in `src/rules/`. It is one layer of defense in depth, not a complete solution.
2. **No detector catches all prompt injection.** Adversaries actively probe and adapt around published detection packages, including this one, since the ruleset is open source by design. Do not treat a `safe: true` result as a guarantee.
3. **Obfuscation decoding is bounded.** Base64/hex decode-and-rescan recurses up to a fixed depth (`MAX_DECODE_DEPTH`, currently 2) to prevent decode-bomb denial-of-service. Attacks nested deeper than this will not be caught by the obfuscation engine (though the pattern/regex/heuristic engines may still catch the un-decoded wrapper text).
4. **Regex safety is audited, not proven.** All built-in regex rules are tested against pathological inputs in CI (`tests/security/redos.test.js`) with a time budget, and the regex engine itself applies a runtime budget guard as defense-in-depth. Community-contributed or custom regex patterns are the responsibility of whoever adds them — review custom patterns for ReDoS risk before deploying them.
5. **Fail-open is the default.** If the scanner encounters an internal error, it allows the request through by default (`blockOnError: false`) rather than blocking it. This favors application availability. If your threat model calls for fail-closed behavior, set `blockOnError: true` explicitly.
6. **Indirect injection detection is structural, not semantic.** The `INDIRECT_INJECTION` category flags structural patterns (bracketed pseudo-roles, embedded instruction-block markers) commonly seen when untrusted content is pulled into a model's context. It cannot fully distinguish malicious embedded instructions from a document that legitimately discusses these patterns (e.g. a security blog post about prompt injection).

## Recommended defense-in-depth

`secure-prompt-shield` is designed to be one layer among several. Also consider:
- Least-privilege tool/function access for your LLM (don't give it access to secrets or destructive actions it doesn't need)
- Output filtering / post-processing on model responses, not just input scanning
- Human-in-the-loop review for high-stakes or irreversible actions
- Isolating untrusted content (documents, web pages, tool outputs) from trusted system instructions where your LLM provider supports it
- Keeping this package and its ruleset up to date — subscribe to releases

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x   | ✅ |

This table will be updated as the project reaches 1.0 and beyond.
