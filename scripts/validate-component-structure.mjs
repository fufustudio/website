import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

const appRoot = join(process.cwd(), "src/app");
const sharedComponentsRoot = join(process.cwd(), "src/components");
const pageModulesRoot = join(process.cwd(), "src/page-modules");

function walk(dir) {
  const files = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    files.push(...(stat.isDirectory() ? walk(path) : [path]));
  }

  return files;
}

const errors = [];

function validateReactFolders(root) {
  if (!existsSync(root)) return;

  for (const file of walk(root)) {
    const filename = basename(file);
    const projectPath = relative(process.cwd(), file);

    if (filename.endsWith(".tsx")) {
      if (filename !== "index.tsx") {
        errors.push(
          `${projectPath} should live in its own kebab-case folder as index.tsx.`,
        );
      }

      const folderName = basename(dirname(file));
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folderName)) {
        errors.push(`${projectPath} should use a kebab-case component folder.`);
      }
    }

    if (!filename.endsWith(".module.css")) continue;

    if (filename !== "styles.module.css") {
      errors.push(
        `${projectPath} should be named styles.module.css inside its component folder.`,
      );
    }

    if (!existsSync(join(dirname(file), "index.tsx"))) {
      errors.push(`${projectPath} should have a sibling index.tsx component.`);
    }
  }
}

for (const root of [sharedComponentsRoot, pageModulesRoot]) {
  validateReactFolders(root);
}

const forbiddenAppDirectories = new Set([
  "components",
  "features",
  "lib",
  "page-modules",
]);
const nextAppFilePattern =
  /^(?:page|layout|template|loading|error|not-found|default|route|global-error|global-not-found|robots|sitemap|manifest|favicon|icon|apple-icon|opengraph-image|twitter-image)(?:\.[^.]+)+$/;

for (const file of walk(appRoot)) {
  const projectPath = relative(process.cwd(), file);
  const segments = projectPath.split("/");

  if (segments.some((segment) => forbiddenAppDirectories.has(segment))) {
    errors.push(
      `${projectPath} is implementation code inside src/app; move it to src/components, src/page-modules, or another top-level source boundary.`,
    );
  }

  if (!nextAppFilePattern.test(basename(file))) {
    errors.push(
      `${projectPath} is not a Next.js route or file-convention entry; src/app is reserved for routing.`,
    );
  }
}

for (const entry of readdirSync(sharedComponentsRoot)) {
  const path = join(sharedComponentsRoot, entry);
  if (!statSync(path).isDirectory()) continue;

  for (const child of readdirSync(path)) {
    if (statSync(join(path, child)).isDirectory()) {
      errors.push(
        `${relative(process.cwd(), join(path, child))} makes the component catalog nested; src/components must stay flat.`,
      );
    }
  }
}

for (const root of [appRoot, sharedComponentsRoot, pageModulesRoot]) {
  if (!existsSync(root)) continue;

  for (const file of walk(root)) {
    if (!file.endsWith(".module.css")) continue;

    const source = readFileSync(file, "utf8");
    if (/(?:#[\da-f]{3,8}|rgba?\()/i.test(source)) {
      errors.push(
        `${relative(process.cwd(), file)} contains a raw color; promote it to the globals.css theme contract.`,
      );
    }
  }
}

for (const root of [appRoot, sharedComponentsRoot, pageModulesRoot]) {
  if (!existsSync(root)) continue;

  for (const file of walk(root)) {
    if (!file.endsWith(".tsx")) continue;

    const source = readFileSync(file, "utf8");
    if (/<h[1-6]\b/.test(source)) {
      errors.push(
        `${relative(process.cwd(), file)} renders a raw heading; use the Heading primitive so semantic level and visual scale stay consistent.`,
      );
    }
  }
}

const packageJson = readFileSync(join(process.cwd(), "package.json"), "utf8");
if (/tailwind/i.test(packageJson)) {
  errors.push(
    "package.json contains a Tailwind dependency; the styling baseline is native CSS and CSS Modules.",
  );
}

if (errors.length) {
  console.error("Component structure check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Route, flat component, and page-module structure check passed.");
