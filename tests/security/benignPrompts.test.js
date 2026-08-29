"use strict";

const { scanPrompt } = require("../../src/scanner");
const benignFixtures = require("../fixtures/benign.json");

describe("security corpus: benign prompts (false-positive regression)", () => {
  it.each(benignFixtures.map((f) => [f.id, f.prompt]))(
    "%s is NOT flagged as unsafe",
    (id, prompt) => {
      const result = scanPrompt(prompt, { threshold: 70, logEvents: false });
      expect(result.safe).toBe(true);
    }
  );

  it("keeps risk scores low for the full benign corpus", () => {
    for (const fixture of benignFixtures) {
      const result = scanPrompt(fixture.prompt, { logEvents: false });
      expect(result.riskScore).toBeLessThan(70);
    }
  });
});
