import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import {
  findRuntimePlaceholders,
  loadEnvironment,
  validateAnalyticsConfiguration,
  validateAttioConfiguration,
  validateLaunch,
  validateSanityConfiguration,
} from "../../scripts/check-launch-ready.mjs";
import {
  checkProviderDisclosures,
  validateProviderDisclosures,
} from "../../scripts/check-provider-disclosures.mjs";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function temporaryRepo() {
  const directory = mkdtempSync(join(tmpdir(), "fufu-verification-"));
  temporaryDirectories.push(directory);
  return directory;
}

describe("launch verification", () => {
  it("requires both Attio values when CRM capture is configured", () => {
    expect(validateAttioConfiguration({})).toEqual([]);
    expect(
      validateAttioConfiguration({ ATTIO_ACCESS_TOKEN: "secret-token" }),
    ).toEqual([expect.stringContaining("ATTIO_INBOUND_LIST_ID")]);
    expect(
      validateAttioConfiguration({
        ATTIO_ACCESS_TOKEN: "secret-token",
        ATTIO_INBOUND_LIST_ID: "inbound-leads",
      }),
    ).toEqual([]);
  });

  it("accepts supported analytics switches and rejects invalid modes", () => {
    expect(
      validateAnalyticsConfiguration({
        NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED: "false",
        NEXT_PUBLIC_GA_CONSENT_MODE: "immediate",
      }),
    ).toEqual([]);

    expect(
      validateAnalyticsConfiguration({
        NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED: "sometimes",
        NEXT_PUBLIC_GA_CONSENT_MODE: "advanced",
      }),
    ).toEqual([
      'NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED must be "true" or "false".',
      'NEXT_PUBLIC_GA_CONSENT_MODE must be "basic" or "immediate".',
    ]);
  });

  it("uses Next production env precedence and variable expansion", () => {
    const root = temporaryRepo();
    writeFileSync(
      join(root, ".env.production"),
      "SCRIPT_ENV_ORDER=production\nSCRIPT_ENV_BASE=/base\nSCRIPT_ENV_EXPANDED=$SCRIPT_ENV_BASE/path\n",
    );
    writeFileSync(join(root, ".env.local"), "SCRIPT_ENV_ORDER=local\n");

    const { webEnv } = loadEnvironment(root, {});

    expect(webEnv.SCRIPT_ENV_ORDER).toBe("local");
    expect(webEnv.SCRIPT_ENV_EXPANDED).toBe("/base/path");
  });

  it("finds placeholders anywhere in runtime source but ignores docs", () => {
    const root = temporaryRepo();
    mkdirSync(join(root, "src/page-modules/example"), {
      recursive: true,
    });
    mkdirSync(join(root, "docs"), { recursive: true });
    writeFileSync(
      join(root, "src/page-modules/example/index.tsx"),
      'export const copy = "Update before launch";',
    );
    writeFileSync(join(root, "docs/fixture.md"), "Fufu Starter");

    expect(findRuntimePlaceholders(root)).toEqual([
      expect.stringContaining("src/page-modules/example/index.tsx"),
    ]);
  });

  it("reports which Sanity identities differ without printing their values", () => {
    const failures = validateSanityConfiguration({
      webEnv: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: "web-secret-id",
        NEXT_PUBLIC_SANITY_DATASET: "production",
        NEXT_PUBLIC_SANITY_API_VERSION: "2026-06-24",
      },
      studioEnv: {
        SANITY_STUDIO_PROJECT_ID: "studio-secret-id",
        SANITY_STUDIO_DATASET: "preview",
        SANITY_STUDIO_API_VERSION: "2025-01-01",
      },
    });

    expect(failures.join("\n")).toContain("project ID, dataset, API version");
    expect(failures.join("\n")).not.toContain("secret-id");
  });

  it("allows an explicitly documented intentional Sanity mismatch", () => {
    expect(
      validateSanityConfiguration({
        webEnv: {
          NEXT_PUBLIC_SANITY_PROJECT_ID: "web-project",
          NEXT_PUBLIC_SANITY_DATASET: "production",
          NEXT_PUBLIC_SANITY_API_VERSION: "2026-06-24",
          SANITY_ALLOW_CONFIG_MISMATCH: "true",
        },
        studioEnv: {
          SANITY_STUDIO_PROJECT_ID: "studio-project",
          SANITY_STUDIO_DATASET: "preview",
          SANITY_STUDIO_API_VERSION: "2025-01-01",
        },
      }),
    ).toEqual([]);
  });

  it("rejects a Studio placeholder without exposing the value", () => {
    const failures = validateSanityConfiguration({
      webEnv: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: "real-project",
        NEXT_PUBLIC_SANITY_DATASET: "production",
        NEXT_PUBLIC_SANITY_API_VERSION: "2026-06-24",
      },
      studioEnv: {
        SANITY_STUDIO_PROJECT_ID: "your-project-id",
        SANITY_STUDIO_DATASET: "production",
        SANITY_STUDIO_API_VERSION: "2026-06-24",
      },
    });

    expect(failures.join("\n")).toContain("placeholder value");
    expect(failures.join("\n")).not.toContain("your-project-id");
  });

  it("rejects dataset and API-version placeholders too", () => {
    const failures = validateSanityConfiguration({
      webEnv: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: "real-project",
        NEXT_PUBLIC_SANITY_DATASET: "your-dataset",
        NEXT_PUBLIC_SANITY_API_VERSION: "YYYY-MM-DD",
      },
      studioEnv: {},
    });

    expect(failures).toHaveLength(2);
    expect(failures.every((failure) => failure.includes("placeholder"))).toBe(
      true,
    );
  });

  it("requires the complete preview configuration when any part is enabled", () => {
    const failures = validateSanityConfiguration({
      webEnv: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: "real-project",
        NEXT_PUBLIC_SANITY_DATASET: "production",
        NEXT_PUBLIC_SANITY_API_VERSION: "2026-06-24",
        NEXT_PUBLIC_SANITY_STUDIO_URL: "https://studio.example.com",
      },
      studioEnv: {
        SANITY_STUDIO_PROJECT_ID: "real-project",
        SANITY_STUDIO_DATASET: "production",
        SANITY_STUDIO_API_VERSION: "2026-06-24",
      },
    });

    expect(failures).toEqual([
      expect.stringContaining("SANITY_API_READ_TOKEN"),
      expect.stringContaining("SANITY_STUDIO_PREVIEW_ORIGIN"),
    ]);
  });

  it("accepts a complete production preview configuration", () => {
    expect(
      validateSanityConfiguration({
        webEnv: {
          NEXT_PUBLIC_SANITY_PROJECT_ID: "real-project",
          NEXT_PUBLIC_SANITY_DATASET: "production",
          NEXT_PUBLIC_SANITY_API_VERSION: "2026-06-24",
          NEXT_PUBLIC_SANITY_STUDIO_URL: "https://studio.example.com",
          SANITY_API_READ_TOKEN: "viewer-token",
        },
        studioEnv: {
          SANITY_STUDIO_PROJECT_ID: "real-project",
          SANITY_STUDIO_DATASET: "production",
          SANITY_STUDIO_API_VERSION: "2026-06-24",
          SANITY_STUDIO_PREVIEW_ORIGIN: "https://www.example-client.com",
        },
      }),
    ).toEqual([]);
  });

  it("rejects local or path-based preview origins at launch", () => {
    const failures = validateSanityConfiguration({
      webEnv: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: "real-project",
        NEXT_PUBLIC_SANITY_DATASET: "production",
        NEXT_PUBLIC_SANITY_API_VERSION: "2026-06-24",
        NEXT_PUBLIC_SANITY_STUDIO_URL:
          "https://studio.example.com/presentation",
        SANITY_API_READ_TOKEN: "viewer-token",
      },
      studioEnv: {
        SANITY_STUDIO_PROJECT_ID: "real-project",
        SANITY_STUDIO_DATASET: "production",
        SANITY_STUDIO_API_VERSION: "2026-06-24",
        SANITY_STUDIO_PREVIEW_ORIGIN: "http://localhost:3000",
      },
    });

    expect(failures.join("\n")).toContain("without a path");
    expect(failures.join("\n")).toContain("must use https");
    expect(failures.join("\n")).toContain("must not point at a local host");
  });

  it("includes provider disclosures in the combined launch gate", () => {
    const root = temporaryRepo();
    const files = [
      ["package.json", '{"dependencies":{"resend":"1.0.0"}}'],
      ["src/content/privacy.ts", "export const privacyContent = {};"],
      [".env.example", ""],
      ["studio/.env.example", ""],
      ["docs/security.md", ""],
      ["docs/forms-analytics.md", ""],
      ["docs/new-project-checklist.md", ""],
    ] as const;

    for (const [path, contents] of files) {
      const file = join(root, path);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, contents);
    }

    const failures = validateLaunch({
      root,
      processEnvironment: {
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://client.example",
        NEXT_PUBLIC_SANITY_PROJECT_ID: "project-id",
        NEXT_PUBLIC_SANITY_DATASET: "production",
        NEXT_PUBLIC_SANITY_API_VERSION: "2026-06-24",
      },
    });

    expect(failures).toContainEqual(expect.stringContaining("Resend"));
  });

  it("accepts Vercel Marketplace Redis environment variables", () => {
    const root = temporaryRepo();
    mkdirSync(join(root, "src/app/api/contact"), { recursive: true });
    writeFileSync(join(root, "src/app/api/contact/route.ts"), "");
    const providerFiles = [
      ["package.json", '{"dependencies":{}}'],
      ["src/content/privacy.ts", ""],
      [".env.example", ""],
      ["studio/.env.example", ""],
      ["docs/security.md", ""],
      ["docs/forms-analytics.md", ""],
      ["docs/new-project-checklist.md", ""],
    ] as const;
    for (const [path, contents] of providerFiles) {
      const file = join(root, path);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, contents);
    }

    const failures = validateLaunch({
      root,
      processEnvironment: {
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://client.test",
        RESEND_API_KEY: "re_test",
        RESEND_FROM_EMAIL: "Website <hello@client.test>",
        RESEND_TO_EMAIL: "inquiries@client.test",
        KV_REST_API_URL: "https://example.upstash.io",
        KV_REST_API_TOKEN: "token",
      },
    });

    expect(failures.join("\n")).not.toContain("shared rate limiting");
  });
});

describe("verification command hierarchy", () => {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  const studioPackageJson = JSON.parse(
    readFileSync(join(process.cwd(), "studio/package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  it("keeps client release checks out of the starter-only gate", () => {
    expect(packageJson.scripts["verify:release"]).toContain("verify:handoff");
    expect(packageJson.scripts["verify:release"]).not.toContain(
      "verify:template",
    );
    expect(packageJson.scripts["verify:handoff"]).toContain("studio:build");
  });

  it("does not expose redundant verification aliases", () => {
    expect(packageJson.scripts["verify:working"]).toBeUndefined();
    expect(packageJson.scripts["verify:ci"]).toBeUndefined();
    expect(packageJson.scripts["privacy:check"]).toBeUndefined();
    expect(packageJson.scripts["sanity:validate-content"]).toBeUndefined();
  });

  it("keeps Sanity key repair dry by default and exposes an explicit apply command", () => {
    expect(studioPackageJson.scripts["repair-keys"]).not.toContain("--apply");
    expect(studioPackageJson.scripts["repair-keys:apply"]).toContain("--apply");
  });
});

describe("provider disclosure verification", () => {
  it("reads visitor-facing privacy content from its current source location", () => {
    const root = temporaryRepo();
    const files = [
      ["package.json", '{"dependencies":{},"devDependencies":{}}'],
      ["src/content/privacy.ts", "export const privacyContent = {};"],
      [".env.example", ""],
      ["studio/.env.example", ""],
      ["docs/security.md", ""],
      ["docs/forms-analytics.md", ""],
      ["docs/new-project-checklist.md", ""],
    ] as const;

    for (const [path, contents] of files) {
      const file = join(root, path);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, contents);
    }

    expect(checkProviderDisclosures(root)).toEqual([]);
  });

  it("does not let setup docs substitute for visitor-facing privacy text", () => {
    const failures = validateProviderDisclosures({
      dependencies: { resend: "1.0.0" },
      publicDisclosureText: "We describe our general privacy practices.",
      setupDocumentationText:
        "Resend RESEND_API_KEY RESEND_FROM_EMAIL RESEND_TO_EMAIL",
    });

    expect(failures).toEqual([
      expect.stringContaining("visitor-facing /privacy"),
    ]);
  });

  it("reports setup omissions independently from public disclosure", () => {
    const failures = validateProviderDisclosures({
      dependencies: { resend: "1.0.0" },
      publicDisclosureText: "Resend processes contact-form delivery.",
      setupDocumentationText: "RESEND_API_KEY",
    });

    expect(failures).toEqual([
      expect.stringContaining("RESEND_FROM_EMAIL"),
      expect.stringContaining("RESEND_TO_EMAIL"),
    ]);
  });

  it("detects providers implemented without an SDK dependency", () => {
    const failures = validateProviderDisclosures({
      dependencies: {},
      implementationText: "fetch('https://api.attio.com/v2/notes')",
      publicDisclosureText: "Attio processes contact-form inquiries.",
      setupDocumentationText: "ATTIO_ACCESS_TOKEN",
    });

    expect(failures).toEqual([
      expect.stringContaining("ATTIO_INBOUND_LIST_ID"),
    ]);
  });
});
