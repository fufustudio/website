import type { SiteSettings } from "@/lib/cms";
import { organizationJsonLd } from "@/lib/seo";

type OrganizationJsonLdProps = {
  siteSettings: SiteSettings;
};

export function OrganizationJsonLd({ siteSettings }: OrganizationJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationJsonLd(siteSettings)).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}
