import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/lib/client";

const token = process.env.SANITY_API_READ_TOKEN?.trim();
const { GET: enableDraftMode } = defineEnableDraftMode({
  client: client.withConfig({ token: token || "" }),
});

export async function GET(request: Request) {
  if (!token) {
    return new Response("Draft Mode is not configured.", { status: 503 });
  }

  return enableDraftMode(request);
}
