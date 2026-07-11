export function sanityStudioFrameAncestors(
  configuredStudioUrl: string | undefined,
  isProduction: boolean,
) {
  const fallback = isProduction ? undefined : "http://localhost:3333";
  const studioOrigin = httpOrigin(configuredStudioUrl?.trim() || fallback);

  return ["'self'", ...(studioOrigin ? [studioOrigin] : [])];
}

function httpOrigin(value: string | undefined) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : undefined;
  } catch {
    return undefined;
  }
}
