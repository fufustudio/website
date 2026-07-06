import crypto from "node:crypto";
import fs from "node:fs";
import { getCliClient } from "sanity/cli";
import { site } from "../src/content/site";

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-24";
const client = getCliClient({ apiVersion }).withConfig({ useCdn: false });
const portraitPath =
  process.env.DANNY_PORTRAIT_SOURCE ||
  "/Users/dannywelstad/Desktop/LSP-KO6A4017.jpeg";
const sarahPortraitPath =
  process.env.SARAH_PORTRAIT_SOURCE ||
  "/Users/dannywelstad/Desktop/ChatGPT Image Jul 6, 2026, 04_12_03 PM.png";

function fileSha1(path: string) {
  return crypto.createHash("sha1").update(fs.readFileSync(path)).digest("hex");
}

async function getOrUploadPortrait(
  path: string,
  filename: string,
  title: string,
) {
  const sha1 = fileSha1(path);
  const existing = await client.fetch<{
    _id: string;
    url: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width?: number; height?: number };
    };
  } | null>(
    `*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]{
      _id,
      url,
      metadata { lqip, dimensions { width, height } }
    }`,
    { sha1 },
  );

  if (existing?._id) return existing;

  return client.assets.upload("image", fs.createReadStream(path), {
    filename,
    title,
  });
}

async function main() {
  if (!fs.existsSync(portraitPath)) {
    throw new Error(`Missing portrait source: ${portraitPath}`);
  }
  if (!fs.existsSync(sarahPortraitPath)) {
    throw new Error(`Missing Sarah portrait source: ${sarahPortraitPath}`);
  }

  const dannyPortrait = await getOrUploadPortrait(
    portraitPath,
    "danny-welstad.jpeg",
    "Danny Welstad portrait",
  );
  const sarahPortrait = await getOrUploadPortrait(
    sarahPortraitPath,
    "sarah-dempsey.png",
    "Sarah Dempsey portrait",
  );

  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    ...site,
  });

  const homePage = {
    _type: "page",
    title: "fufu studio",
    slug: { _type: "slug", current: "home" },
    description:
      "Building bespoke sites & software for businesses who care how they show up online",
    about: {
      _type: "aboutSection",
      eyebrow: "03 — About",
      heading: "Your team of two",
      intro:
        "You work directly with the two people making your site — a designer and an engineer, with a combined 18 years of experience. No handoffs, no account managers, no drift.",
      people: [
        {
          _key: "sarah-dempsey",
          _type: "teamMember",
          role: "Design",
          name: "Sarah Dempsey",
          href: "https://www.linkedin.com/in/sasdempsey/",
          portrait: {
            _type: "imageWithAlt",
            asset: { _type: "reference", _ref: sarahPortrait._id },
            alt: "Sarah Dempsey smiling in a denim shirt.",
            hotspot: {
              _type: "sanity.imageHotspot",
              x: 0.5,
              y: 0.32,
              height: 0.58,
              width: 0.5,
            },
            crop: {
              _type: "sanity.imageCrop",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
          },
          bio: "Leads brand, layout, type, and the feel of every interaction — turning your goals into a site that's clear, credible, and specific to you.",
        },
        {
          _key: "danny-welstad",
          _type: "teamMember",
          role: "Engineering",
          name: "Danny Welstad",
          href: "https://www.linkedin.com/in/danny-welstad",
          portrait: {
            _type: "imageWithAlt",
            asset: { _type: "reference", _ref: dannyPortrait._id },
            alt: "Danny Welstad smiling in a green jacket.",
            hotspot: {
              _type: "sanity.imageHotspot",
              x: 0.5,
              y: 0.28,
              height: 0.56,
              width: 0.45,
            },
            crop: {
              _type: "sanity.imageCrop",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
          },
          bio: "Leads build, performance, and integrations — making the design hold up in the real world: fast, responsive, and easy to maintain.",
        },
      ],
    },
  };

  const existingHome = await client.fetch<{ _id: string } | null>(
    `*[_type == "page" && slug.current == "home"][0]{_id}`,
  );

  let homeId: string;
  if (existingHome?._id) {
    await client.patch(existingHome._id).set(homePage).commit();
    homeId = existingHome._id;
  } else {
    const created = await client.create(homePage);
    homeId = created._id;
  }

  console.log(
    JSON.stringify(
      {
        homeId,
        dannyPortraitId: dannyPortrait._id,
        dannyPortraitUrl: dannyPortrait.url,
        sarahPortraitId: sarahPortrait._id,
        sarahPortraitUrl: sarahPortrait.url,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("[seed-home-content] Failed:", error);
  process.exit(1);
});
