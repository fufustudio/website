import { getCliClient } from "sanity/cli";

const apiVersion = process.env.SANITY_STUDIO_API_VERSION || "2026-06-24";
const client = getCliClient({ apiVersion }).withConfig({ useCdn: false });

const query = /* groq */ `
{
  "missingDocuments": [
    select(!defined(*[_id == "siteSettings"][0]._id) => "siteSettings", null),
    select(!defined(*[_type == "page" && slug.current == "home" && !(_id in path("drafts.**"))][0]._id) => "page:home", null)
  ][@ != null],
  "missingRequiredValues": [
    select(!defined(*[_id == "siteSettings"][0].name) => "siteSettings.name", null),
    select(!defined(*[_type == "page" && slug.current == "home" && !(_id in path("drafts.**"))][0].title) => "page:home.title", null)
  ][@ != null],
  "invalidDocuments": *[
    _type in ["page", "service"] &&
    !(_id in path("drafts.**")) &&
    (!defined(title) || !defined(slug.current))
  ]{
    _id,
    _type,
    "missingFields": [
      select(!defined(title) => "title", null),
      select(!defined(slug.current) => "slug", null)
    ][@ != null]
  }
}
`;

type ValidationResult = {
  missingDocuments: string[];
  missingRequiredValues: string[];
  invalidDocuments: Array<{
    _id: string;
    _type: "page" | "service";
    missingFields: string[];
  }>;
};

async function main() {
  const result = await client.fetch<ValidationResult>(query);

  if (
    result.missingDocuments.length ||
    result.missingRequiredValues.length ||
    result.invalidDocuments.length
  ) {
    console.error("[content] Validation failed:");
    console.error(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log("[content] Validation passed.");
}

main().catch((error) => {
  console.error("[content] Validation failed:", error);
  process.exit(1);
});
