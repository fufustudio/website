import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import nextEnv from "@next/env";

import { checkProviderDisclosures } from "./check-provider-disclosures.mjs";

const { loadEnvConfig, resetEnv, updateInitialEnv } = nextEnv;

const RUNTIME_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const RUNTIME_PLACEHOLDERS = [
  "Update before launch",
  "hello@example.com",
  "contact@example.com",
  "your-project-id",
  "Fufu Starter",
];

export function loadEnvironment(root, processEnvironment) {
  const logger = { info() {}, error: console.error };
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  updateInitialEnv({ NODE_ENV: "production" });

  try {
    const webEnv = {
      ...loadEnvConfig(root, false, logger, true).combinedEnv,
      ...processEnvironment,
    };
    const studioEnv = {
      ...loadEnvConfig(join(root, "studio"), false, logger, true).combinedEnv,
      ...processEnvironment,
    };

    return { webEnv, studioEnv };
  } finally {
    resetEnv();
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    updateInitialEnv({ NODE_ENV: originalNodeEnv });
  }
}

function trimmed(env, name) {
  return env[name]?.trim();
}

function rejectPlaceholder(failures, env, name, placeholders) {
  const currentValue = trimmed(env, name);
  if (!currentValue) return;
  const normalized = currentValue.toLowerCase();
  if (placeholders.some((item) => normalized.includes(item.toLowerCase()))) {
    failures.push(`${name} still contains a placeholder value.`);
  }
}

function validateProductionOrigin(failures, value, name) {
  if (!value) return;

  try {
    const parsed = new URL(value);
    const isOriginOnly =
      parsed.pathname === "/" && !parsed.search && !parsed.hash;
    const hostname = parsed.hostname.toLowerCase();

    if (parsed.protocol !== "https:") {
      failures.push(`${name} must use https for launch.`);
    }
    if (!isOriginOnly) {
      failures.push(
        `${name} must be an origin without a path, query, or hash.`,
      );
    }
    if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname)) {
      failures.push(`${name} must not point at a local host for launch.`);
    }
  } catch {
    failures.push(`${name} must be an absolute URL origin.`);
  }
}

export function validateSanityConfiguration({ webEnv, studioEnv }) {
  const failures = [];
  const webNames = [
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "NEXT_PUBLIC_SANITY_DATASET",
    "NEXT_PUBLIC_SANITY_API_VERSION",
  ];
  const studioNames = [
    "SANITY_STUDIO_PROJECT_ID",
    "SANITY_STUDIO_DATASET",
    "SANITY_STUDIO_API_VERSION",
  ];
  const webValues = webNames.map((name) => trimmed(webEnv, name));
  const studioValues = studioNames.map((name) => trimmed(studioEnv, name));
  const webStarted = webValues.some(Boolean);
  const studioStarted = studioValues.some(Boolean);

  if (!webStarted) {
    failures.push(
      "Configure the three NEXT_PUBLIC_SANITY_* values before client launch.",
    );
  } else {
    webNames.forEach((name, index) => {
      if (!webValues[index])
        failures.push(`${name} is required for live CMS content.`);
    });
  }

  if (studioStarted) {
    studioNames.forEach((name, index) => {
      if (!studioValues[index])
        failures.push(`${name} is required when Studio is configured.`);
    });
  }

  rejectPlaceholder(failures, webEnv, "NEXT_PUBLIC_SANITY_PROJECT_ID", [
    "your-project-id",
  ]);
  rejectPlaceholder(failures, webEnv, "NEXT_PUBLIC_SANITY_DATASET", [
    "your-dataset",
  ]);
  rejectPlaceholder(failures, webEnv, "NEXT_PUBLIC_SANITY_API_VERSION", [
    "yyyy-mm-dd",
    "your-api-version",
  ]);
  rejectPlaceholder(failures, studioEnv, "SANITY_STUDIO_PROJECT_ID", [
    "your-project-id",
  ]);
  rejectPlaceholder(failures, studioEnv, "SANITY_STUDIO_DATASET", [
    "your-dataset",
  ]);
  rejectPlaceholder(failures, studioEnv, "SANITY_STUDIO_API_VERSION", [
    "yyyy-mm-dd",
    "your-api-version",
  ]);

  const previewToken = trimmed(webEnv, "SANITY_API_READ_TOKEN");
  const studioUrl = trimmed(webEnv, "NEXT_PUBLIC_SANITY_STUDIO_URL");
  const previewOrigin = trimmed(studioEnv, "SANITY_STUDIO_PREVIEW_ORIGIN");
  const previewStarted = Boolean(previewToken || studioUrl || previewOrigin);

  if (previewStarted) {
    if (!previewToken) {
      failures.push(
        "SANITY_API_READ_TOKEN is required when Sanity preview is configured.",
      );
    }
    if (!studioUrl) {
      failures.push(
        "NEXT_PUBLIC_SANITY_STUDIO_URL is required when Sanity preview is configured.",
      );
    }
    if (!previewOrigin) {
      failures.push(
        "SANITY_STUDIO_PREVIEW_ORIGIN is required when Sanity preview is configured.",
      );
    }

    validateProductionOrigin(
      failures,
      studioUrl,
      "NEXT_PUBLIC_SANITY_STUDIO_URL",
    );
    validateProductionOrigin(
      failures,
      previewOrigin,
      "SANITY_STUDIO_PREVIEW_ORIGIN",
    );
  }

  const allowMismatch =
    trimmed(webEnv, "SANITY_ALLOW_CONFIG_MISMATCH") === "true" ||
    trimmed(studioEnv, "SANITY_ALLOW_CONFIG_MISMATCH") === "true";
  if (
    webValues.every(Boolean) &&
    studioValues.every(Boolean) &&
    !allowMismatch
  ) {
    const mismatches = [
      [webValues[0], studioValues[0], "project ID"],
      [webValues[1], studioValues[1], "dataset"],
      [webValues[2], studioValues[2], "API version"],
    ]
      .filter(([webValue, studioValue]) => webValue !== studioValue)
      .map(([, , label]) => label);
    if (mismatches.length > 0) {
      failures.push(
        `Web and Studio Sanity configuration disagree on: ${mismatches.join(", ")}. Set SANITY_ALLOW_CONFIG_MISMATCH=true only when this is intentional.`,
      );
    }
  }

  return failures;
}

export function findRuntimePlaceholders(root) {
  const sourceRoot = join(root, "src");
  if (!existsSync(sourceRoot)) return [];
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (RUNTIME_EXTENSIONS.has(extname(entry.name))) files.push(path);
    }
  };
  visit(sourceRoot);

  const failures = [];
  for (const path of files) {
    const source = readFileSync(path, "utf8");
    for (const placeholder of RUNTIME_PLACEHOLDERS) {
      if (source.includes(placeholder)) {
        failures.push(
          `Runtime placeholder "${placeholder}" remains in ${relative(root, path)}.`,
        );
      }
    }
  }
  return failures;
}

export function validateLaunch({ root, processEnvironment = process.env }) {
  const { webEnv, studioEnv } = loadEnvironment(root, processEnvironment);
  const failures = [];
  const value = (name) => trimmed(webEnv, name);
  const requireValue = (name, reason) => {
    const currentValue = value(name);
    if (!currentValue) failures.push(`${name} is required ${reason}.`);
    return currentValue;
  };

  const siteUrl = requireValue(
    "NEXT_PUBLIC_SITE_URL",
    "for production metadata, canonicals, robots, and sitemap URLs",
  );
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      const hostname = parsed.hostname.toLowerCase();
      if (parsed.protocol !== "https:")
        failures.push("NEXT_PUBLIC_SITE_URL must use https for launch.");
      if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname)) {
        failures.push(
          "NEXT_PUBLIC_SITE_URL must not point at a local host for launch.",
        );
      }
      if (
        hostname === "example.com" ||
        hostname.endsWith(".example.com") ||
        hostname.endsWith(".example.org") ||
        hostname.endsWith(".example.net")
      )
        failures.push("NEXT_PUBLIC_SITE_URL must not use an example domain.");
    } catch {
      failures.push("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
    }
  }

  failures.push(...validateSanityConfiguration({ webEnv, studioEnv }));

  const contactFormExists =
    existsSync(
      join(root, "src/app/(site)/(home)/components/contact-form/index.tsx"),
    ) || existsSync(join(root, "src/app/api/contact/route.ts"));
  if (contactFormExists) {
    requireValue(
      "RESEND_API_KEY",
      "because the website contact form is present",
    );
    requireValue(
      "RESEND_FROM_EMAIL",
      "because the website contact form is present",
    );
    requireValue(
      "RESEND_TO_EMAIL",
      "because the website contact form is present",
    );
    if (!value("UPSTASH_REDIS_REST_URL") && !value("KV_REST_API_URL")) {
      failures.push(
        "UPSTASH_REDIS_REST_URL or KV_REST_API_URL is required because the website contact form requires shared rate limiting.",
      );
    }
    if (!value("UPSTASH_REDIS_REST_TOKEN") && !value("KV_REST_API_TOKEN")) {
      failures.push(
        "UPSTASH_REDIS_REST_TOKEN or KV_REST_API_TOKEN is required because the website contact form requires shared rate limiting.",
      );
    }
    rejectPlaceholder(failures, webEnv, "RESEND_FROM_EMAIL", ["example.com"]);
    rejectPlaceholder(failures, webEnv, "RESEND_TO_EMAIL", ["example.com"]);
  }

  const gaId = value("NEXT_PUBLIC_GA_MEASUREMENT_ID");
  if (gaId && !/^G-[A-Z0-9]+$/i.test(gaId)) {
    failures.push(
      "NEXT_PUBLIC_GA_MEASUREMENT_ID should be only a G-... Measurement ID.",
    );
  }

  failures.push(...findRuntimePlaceholders(root));
  failures.push(...checkProviderDisclosures(root));
  return failures;
}

function main() {
  const failures = validateLaunch({ root: process.cwd() });
  if (failures.length > 0) {
    console.error(
      [
        "[launch] Client launch readiness check failed.",
        "",
        ...failures.map((failure) => `- ${failure}`),
        "",
        "This check is intentionally stricter than local verification. Update production environment values and runtime content before launch.",
      ].join("\n"),
    );
    process.exitCode = 1;
    return;
  }
  console.log("[launch] Client launch readiness checks passed.");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
