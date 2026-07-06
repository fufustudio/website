import { type SchemaTypeDefinition } from "sanity";

import { page } from "./documents/page";
import { post } from "./documents/post";
import { service } from "./documents/service";
import { siteSettings } from "./documents/siteSettings";
import {
  aboutSection,
  address,
  cta,
  imageWithAlt,
  pageHeader,
  simplePortableText,
  teamMember,
} from "./objects/shared";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    address,
    cta,
    imageWithAlt,
    teamMember,
    aboutSection,
    pageHeader,
    simplePortableText,
    siteSettings,
    page,
    service,
    post,
  ],
};
