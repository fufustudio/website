type SanityImageEnvironment = {
  NEXT_PUBLIC_SANITY_PROJECT_ID?: string;
  NEXT_PUBLIC_SANITY_DATASET?: string;
  [name: string]: string | undefined;
};

export function sanityImageRemotePatterns(
  environment: SanityImageEnvironment = process.env,
) {
  const projectId = environment.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset =
    environment.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";

  if (!projectId) return [];

  return [
    {
      protocol: "https" as const,
      hostname: "cdn.sanity.io",
      pathname: `/images/${projectId}/${dataset}/**`,
    },
  ];
}
