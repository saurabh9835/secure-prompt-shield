"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const consoleSink = require("../../src/logging/sinks/consoleSink");
const jsonSink = require("../../src/logging/sinks/jsonSink");
const fileSink = require("../../src/logging/sinks/fileSink");
const { buildEvent } = require("../../src/logging/eventSchema");

describe("logging sinks", () => {
  const sampleEvent = buildEvent({
    riskScore: 92,
    severity: "critical",
    categories: ["SYSTEM_PROMPT_EXTRACTION"],
    blocked: true,
    scanTimeMs: 4
  });

  describe("consoleSink", () => {
    it("uses console.warn for high/critical severity", () => {
      const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
      consoleSink(sampleEvent);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toContain("severity=critical");
      spy.mockRestore();
    });

    it("uses console.log for low/medium severity", () => {
      const lowEvent = { ...sampleEvent, severity: "low" };
      const spy = jest.spyOn(console, "log").mockImplementation(() => {});
      consoleSink(lowEvent);
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });

  describe("jsonSink", () => {
    it("logs a single JSON line to stdout", () => {
      const spy = jest.spyOn(console, "log").mockImplementation(() => {});
      jsonSink(sampleEvent);
      expect(spy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(spy.mock.calls[0][0]);
      expect(parsed.riskScore).toBe(92);
      spy.mockRestore();
    });
  });

  describe("fileSink", () => {
    const tmpFile = path.join(os.tmpdir(), `prompt-shield-test-${Date.now()}.log`);

    afterEach(() => {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    });

    it("appends a JSON line to the given file path", (done) => {
      fileSink(sampleEvent, tmpFile);
      // fs.appendFile is async; poll briefly for the write to land.
      setTimeout(() => {
        const content = fs.readFileSync(tmpFile, "utf8");
        expect(content.trim().length).toBeGreaterThan(0);
        expect(JSON.parse(content.trim())).toMatchObject({ riskScore: 92 });
        done();
      }, 50);
    });

    it("logs an error and does not throw when the write fails", (done) => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      const badPath = "/nonexistent-directory-xyz/prompt-shield.log";
      expect(() => fileSink(sampleEvent, badPath)).not.toThrow();
      setTimeout(() => {
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
        done();
      }, 50);
    });
  });
});
