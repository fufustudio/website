import { defineQuery } from "groq";

export const siteSettingsQuery = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    name,
    contactName,
    email,
    phone,
    address,
    hours,
    primaryActionLabel,
    primaryActionUrl,
    tagline,
    areaServed,
    sameAs
  }
`);
