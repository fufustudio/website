export const providerRegistry = [
  {
    name: "Vercel Analytics",
    dependencyNames: ["@vercel/analytics"],
    publicDisclosureText: ["Vercel Analytics"],
    setupDocumentationText: [
      "Vercel Analytics",
      "NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED",
    ],
  },
  {
    name: "Vercel Speed Insights",
    dependencyNames: ["@vercel/speed-insights"],
    publicDisclosureText: ["Vercel Speed Insights"],
    setupDocumentationText: ["Vercel Speed Insights"],
  },
  {
    name: "Google Analytics",
    dependencyNames: ["@next/third-parties"],
    publicDisclosureText: ["Google Analytics"],
    setupDocumentationText: [
      "NEXT_PUBLIC_GA_MEASUREMENT_ID",
      "NEXT_PUBLIC_GA_CONSENT_MODE",
    ],
  },
  {
    name: "Resend",
    dependencyNames: ["resend"],
    publicDisclosureText: ["Resend"],
    setupDocumentationText: [
      "RESEND_API_KEY",
      "RESEND_FROM_EMAIL",
      "RESEND_TO_EMAIL",
    ],
  },
  {
    name: "Attio",
    dependencyNames: [],
    implementationPaths: ["src/server/contact/destinations/attio-crm.ts"],
    implementationText: ["api.attio.com"],
    publicDisclosureText: ["Attio"],
    setupDocumentationText: ["ATTIO_ACCESS_TOKEN", "ATTIO_INBOUND_LIST_ID"],
  },
  {
    name: "Upstash",
    dependencyNames: ["@upstash/ratelimit", "@upstash/redis"],
    publicDisclosureText: ["Upstash"],
    setupDocumentationText: [
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ],
  },
  {
    name: "Sanity",
    dependencyNames: ["@sanity/client", "sanity", "next-sanity"],
    publicDisclosureText: ["Sanity"],
    setupDocumentationText: [
      "NEXT_PUBLIC_SANITY_PROJECT_ID",
      "SANITY_STUDIO_PROJECT_ID",
    ],
  },
];
