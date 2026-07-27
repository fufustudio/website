import "server-only";

import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { optionalEnvValue } from "@/config/env";

const requestLimit = 5;
const requestWindow = "10 m";
const providerTimeoutMs = 2_500;

type RateLimitResult =
  | { status: "allowed" }
  | { status: "limited"; retryAfter: number }
  | { status: "unavailable"; missingEnvVars: string[] };

let configuredLimiter:
  { url: string; token: string; limiter: Ratelimit } | undefined;

export async function checkContactRateLimit(
  request: Request,
): Promise<RateLimitResult> {
  const url =
    optionalEnvValue(process.env.UPSTASH_REDIS_REST_URL) ??
    optionalEnvValue(process.env.KV_REST_API_URL);
  const token =
    optionalEnvValue(process.env.UPSTASH_REDIS_REST_TOKEN) ??
    optionalEnvValue(process.env.KV_REST_API_TOKEN);
  const missingEnvVars = [
    ...(url ? [] : ["UPSTASH_REDIS_REST_URL or KV_REST_API_URL"]),
    ...(token ? [] : ["UPSTASH_REDIS_REST_TOKEN or KV_REST_API_TOKEN"]),
  ];

  if (missingEnvVars.length > 0) {
    return process.env.NODE_ENV === "production"
      ? { status: "unavailable", missingEnvVars }
      : { status: "allowed" };
  }

  const clientAddress = getClientAddress(request);
  if (!clientAddress) {
    return process.env.NODE_ENV === "production"
      ? { status: "unavailable", missingEnvVars: ["trusted client IP"] }
      : { status: "allowed" };
  }

  const limiter = getLimiter(url as string, token as string);
  let result: Awaited<ReturnType<Ratelimit["limit"]>>;
  try {
    result = await withTimeout(
      limiter.limit(hashIdentifier(clientAddress)),
      providerTimeoutMs,
    );
  } catch (error) {
    console.error("[contact] Rate-limit provider error:", error);
    return { status: "unavailable", missingEnvVars: ["rate-limit service"] };
  }

  if (result.success) return { status: "allowed" };

  return {
    status: "limited",
    retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
  };
}

function getLimiter(url: string, token: string) {
  if (configuredLimiter?.url === url && configuredLimiter.token === token) {
    return configuredLimiter.limiter;
  }

  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requestLimit, requestWindow),
    prefix: "fufu:contact",
  });
  configuredLimiter = { url, token, limiter };
  return limiter;
}

function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () => reject(new Error("Rate-limit provider request timed out.")),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, deadline]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
