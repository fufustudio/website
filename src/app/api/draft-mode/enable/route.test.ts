import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-sanity/draft-mode", () => ({
  defineEnableDraftMode: () => ({
    GET: vi.fn(() => new Response(null, { status: 204 })),
  }),
}));

describe("Draft Mode enable route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("rejects preview activation when the Viewer token is missing", async () => {
    vi.stubEnv("SANITY_API_READ_TOKEN", "");
    const { GET } = await import("./route");

    const response = await GET(
      new Request("https://example.com/api/draft-mode/enable"),
    );

    expect(response.status).toBe(503);
    await expect(response.text()).resolves.toBe(
      "Draft Mode is not configured.",
    );
  });
});
