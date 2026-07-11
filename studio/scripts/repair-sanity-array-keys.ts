import { getCliClient } from "sanity/cli";

const apiVersion = process.env.SANITY_STUDIO_API_VERSION || "2026-06-24";
const client = getCliClient({ apiVersion }).withConfig({ useCdn: false });
const applyChanges =
  process.env.SANITY_APPLY === "1" || process.argv.includes("--apply");

type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type SanityDocument = JsonObject & {
  _id: string;
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function keyFor(value: JsonValue, index: number) {
  if (typeof value === "object" && value && !Array.isArray(value)) {
    const title = value.title;
    if (typeof title === "string" && title.trim()) {
      return `${index}-${slugify(title)}`;
    }
  }

  return `item-${index}`;
}

function repairValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const repaired = repairValue(item);
      if (
        repaired &&
        typeof repaired === "object" &&
        !Array.isArray(repaired) &&
        !("_key" in repaired)
      ) {
        return { _key: keyFor(repaired, index), ...repaired };
      }

      return repaired;
    });
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, repairValue(child)]),
    );
  }

  return value;
}

function stripSystemFields(document: SanityDocument) {
  const { _id, _rev, _createdAt, _updatedAt, ...content } = document;
  void _createdAt;
  void _updatedAt;
  return { _id, _rev, content };
}

async function main() {
  const documents = await client.fetch<SanityDocument[]>(
    `*[_type in ["siteSettings", "page", "service"]]`,
  );

  for (const document of documents) {
    const { _id, _rev, content } = stripSystemFields(document);
    const repaired = repairValue(content) as SanityDocument;

    if (JSON.stringify(content) === JSON.stringify(repaired)) continue;

    if (!applyChanges) {
      console.log(`[repair-keys] Would patch ${_id}`);
    } else {
      if (!_rev) throw new Error(`Missing revision for ${_id}`);
      await client.patch(_id).ifRevisionId(_rev).set(repaired).commit();
      console.log(`[repair-keys] Patched ${_id}`);
    }
  }

  if (!applyChanges) {
    console.log(
      "[repair-keys] Dry run only. Use the explicit apply command after reviewing this list.",
    );
  }
}

main().catch((error) => {
  console.error("[repair-keys] Failed:", error);
  process.exit(1);
});
