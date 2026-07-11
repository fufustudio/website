import type { SchemaTypeDefinition } from "sanity";

import { page } from "./documents/page";
import { service } from "./documents/service";
import { siteSettings } from "./documents/site-settings";
import {
  address,
  cta,
  imageWithAlt,
  pageHeader,
  simplePortableText,
} from "./objects/shared";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    address,
    cta,
    imageWithAlt,
    pageHeader,
    simplePortableText,
    siteSettings,
    page,
    service,
  ],
};
