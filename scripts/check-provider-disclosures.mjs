import { pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { providerRegistry } from "./provider-registry.mjs";

function read(root, path) {
  return readFileSync(join(root, path), "utf8");
}

export function validateProviderDisclosures({
  dependencies,
  implementationText = "",
  publicDisclosureText,
  setupDocumentationText,
}) {
  const failures = [];

  for (const provider of providerRegistry) {
    const active =
      provider.dependencyNames.some((name) => dependencies[name]) ||
      provider.implementationText?.some((text) =>
        implementationText.includes(text),
      );
    if (!active) continue;

    for (const required of provider.publicDisclosureText) {
      if (!publicDisclosureText.includes(required)) {
        failures.push(
          `${provider.name}: visitor-facing /privacy content is missing "${required}".`,
        );
      }
    }

    for (const required of provider.setupDocumentationText) {
      if (!setupDocumentationText.includes(required)) {
        failures.push(
          `${provider.name}: setup documentation is missing "${required}".`,
        );
      }
    }
  }

  return failures;
}

export function checkProviderDisclosures(root = process.cwd()) {
  const packageJson = JSON.parse(read(root, "package.json"));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  const implementationText = providerRegistry
    .flatMap((provider) => provider.implementationPaths ?? [])
    .filter((path) => exists(root, path))
    .map((path) => read(root, path))
    .join("\n");
  const publicDisclosureText = read(root, "src/content/privacy.ts");
  const setupDocumentationText = [
    read(root, ".env.example"),
    read(root, "studio/.env.example"),
    read(root, "docs/security.md"),
    read(root, "docs/forms-analytics.md"),
    read(root, "docs/new-project-checklist.md"),
  ].join("\n");

  return validateProviderDisclosures({
    dependencies,
    implementationText,
    publicDisclosureText,
    setupDocumentationText,
  });
}

function exists(root, path) {
  try {
    read(root, path);
    return true;
  } catch {
    return false;
  }
}

function main() {
  const failures = checkProviderDisclosures();
  if (failures.length > 0) {
    console.error(
      [
        "[privacy] Provider disclosure check failed.",
        "",
        "Visitor-facing privacy text and internal setup documentation are checked separately; one cannot satisfy the other.",
        "",
        ...failures.map((item) => `- ${item}`),
      ].join("\n"),
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    "[privacy] Public disclosures and setup docs cover the configured website providers.",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
