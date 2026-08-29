"use strict";

const { resolveConfig } = require("../../src/config/configValidator");

describe("configValidator", () => {
  it("returns defaults when called with no arguments", () => {
    const config = resolveConfig();
    expect(config.threshold).toBe(70);
    expect(config.blockHighRisk).toBe(true);
  });

  it("merges user overrides with defaults", () => {
    const config = resolveConfig({ threshold: 50, logEvents: false });
    expect(config.threshold).toBe(50);
    expect(config.logEvents).toBe(false);
    expect(config.blockHighRisk).toBe(true); // untouched default preserved
  });

  it("throws on out-of-range threshold", () => {
    expect(() => resolveConfig({ threshold: 150 })).toThrow(RangeError);
    expect(() => resolveConfig({ threshold: -1 })).toThrow(RangeError);
  });

  it("throws on wrong type for boolean flags", () => {
    expect(() => resolveConfig({ blockHighRisk: "yes" })).toThrow(TypeError);
  });

  it("throws on non-array customPatterns", () => {
    expect(() => resolveConfig({ customPatterns: "not-an-array" })).toThrow(TypeError);
  });

  it("throws on invalid logSink string", () => {
    expect(() => resolveConfig({ logSink: "carrier-pigeon" })).toThrow(TypeError);
  });

  it("accepts a function as logSink", () => {
    const fn = () => {};
    const config = resolveConfig({ logSink: fn });
    expect(config.logSink).toBe(fn);
  });

  it("returns a frozen object", () => {
    const config = resolveConfig();
    expect(Object.isFrozen(config)).toBe(true);
  });
});
