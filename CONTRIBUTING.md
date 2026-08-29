# Contributing to secure-prompt-shield

Thanks for considering a contribution. This project especially benefits from community-contributed detection rules and false-positive reports, since prompt injection phrasing evolves constantly.

## Ways to contribute

- **Report a false positive** — a benign prompt incorrectly flagged as unsafe. Open an issue with the `false-positive` label, including the exact prompt text and the config you used.
- **Report a false negative / detection bypass** — see [SECURITY.md](./SECURITY.md) for the private disclosure process if it represents a meaningful bypass; otherwise a regular issue with the `false-negative` label is fine for minor gaps.
- **Add a new rule** — new phrase/regex signatures for any of the 7 threat categories.
- **Improve the heuristic or obfuscation engines.**
- **Build a new framework adapter** (Fastify, Koa, NestJS, Hono, Next.js) — see `src/middleware/adapterInterface.js` for the required contract before starting.
- **Improve docs, examples, or tests.**

## Development setup

```bash
git clone https://github.com/<your-fork>/secure-prompt-shield.git
cd secure-prompt-shield
npm install
npm test
```

```bash
npm run lint          # ESLint
npm run test:coverage # Jest with coverage report
```

## Adding a new detection rule

Rules live in `src/rules/<category>.js` as plain data objects — you should almost never need to touch engine code (`src/engines/`) to add a new rule.

1. Pick the right file for the category (`directInjection.js`, `jailbreak.js`, etc.) or `indirectInjection.js` if it doesn't fit elsewhere.
2. Follow the shape validated by `src/rules/ruleSchema.js`:

   ```javascript
   {
     id: "DI-010",              // unique, prefixed by category convention (DI-, SPE-, RM-, JB-, DE-, OB-, II-)
     category: CATEGORIES.DIRECT_INJECTION,
     type: "pattern",           // or "regex"
     value: "your phrase here", // string for pattern, RegExp for regex
     weight: 0.7,                // 0-1, see "Choosing a weight" below
     description: "Human-readable explanation shown in reports."
   }
   ```

3. **If it's a regex rule**, make sure it's anchored and bounded — avoid nested quantifiers like `(a+)+` that are vulnerable to catastrophic backtracking. Add it to `tests/security/redos.test.js`'s coverage automatically applies (it iterates all built-in rules), but please also sanity-check it locally against a long pathological string before submitting.
4. **Add at least one positive fixture** (a malicious prompt that should trigger it) to `tests/fixtures/malicious.json`, and **at least one near-miss negative fixture** (similar wording, but benign) to `tests/fixtures/benign.json` if there's a plausible benign phrasing that's close to your new rule.
5. Run `npm test` — both the rule-level and corpus-level tests must pass.

### Choosing a weight

Weight (0–1) reflects confidence that a match indicates real malicious intent, independent of category severity (which is handled separately in `src/scoring/weights.js`).

- `0.9–1.0`: unambiguous, rarely appears in benign text (e.g. "ignore all previous instructions")
- `0.6–0.85`: strong signal but with some plausible benign overlap
- `0.3–0.55`: weak/contextual signal, meant to combine with other findings rather than trigger alone

If you're unsure, err lower and let the maintainer/reviewers calibrate — a rule that's too aggressive causes false positives across every application using the package.

## Pull request checklist

- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] New rules include both a malicious and (where applicable) benign fixture
- [ ] New regex rules have been sanity-checked against pathological input
- [ ] Public API changes are documented in `README.md`
- [ ] `CHANGELOG.md` updated under "Unreleased"

## Code style

- Plain CommonJS (`require`/`module.exports`), no build step for the core library
- JSDoc comments on exported functions
- Prefer small, focused modules — rules are data, engines are logic, keep that separation

## Reporting security issues

Please do **not** open a public issue for a meaningful detection bypass or a vulnerability in the package itself — see [SECURITY.md](./SECURITY.md) for the private disclosure process.

## Code of conduct

Be respectful and constructive. This is a security tool used by other people's production applications — reviews may be strict about correctness and false-positive risk, not as a judgment of contributors.
