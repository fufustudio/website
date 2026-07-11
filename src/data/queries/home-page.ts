import { defineQuery } from "groq";

export const homePageQuery = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == "home"][0]{
    title,
    "intro": description,
    body
  }
`);
