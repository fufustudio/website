import type { StructureResolver } from "sanity/structure";

const configuredTypes = new Set(["siteSettings", "page", "service"]);

function singletonListItem(
  S: Parameters<StructureResolver>[0],
  id: string,
  title: string,
) {
  return S.listItem()
    .title(title)
    .id(id)
    .child(S.document().schemaType(id).documentId(id).title(title));
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      singletonListItem(S, "siteSettings", "Site Settings"),
      S.divider(),
      S.documentTypeListItem("page").title("Pages"),
      S.documentTypeListItem("service").title("Services"),
      ...S.documentTypeListItems().filter(
        (item) => !configuredTypes.has(item.getId() ?? ""),
      ),
    ]);
