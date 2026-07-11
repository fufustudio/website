import { createClient } from "@sanity/client";

import {
  apiVersion,
  dataset,
  isSanityConfigured,
  projectId,
  studioUrl,
} from "../env";

export { isSanityConfigured };

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: studioUrl ? { studioUrl } : false,
});
