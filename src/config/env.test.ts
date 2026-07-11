import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { optionalEnvValue } from "./env";

describe("optionalEnvValue", () => {
  it("trims values and returns undefined for empty input", () => {
    expect(optionalEnvValue(" value ")).toBe("value");
    expect(optionalEnvValue("   ")).toBeUndefined();
    expect(optionalEnvValue(undefined)).toBeUndefined();
  });
});

describe("public env access", () => {
  it("keeps browser-bound variables statically addressable by Next", () => {
    const source = readFileSync(new URL("./env.ts", import.meta.url), "utf8");

    expect(source).not.toContain("process.env[");
    expect(source).toContain("process.env.NEXT_PUBLIC_SANITY_PROJECT_ID");
    expect(source).toContain("process.env.NEXT_PUBLIC_SANITY_DATASET");
  });
});
