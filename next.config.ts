import type { NextConfig } from "next";
import { sanity as sanityCacheLife } from "next-sanity/live/cache-life";
import path from "node:path";
import { sanityImageRemotePatterns } from "./src/config/images";
import { sanityStudioFrameAncestors } from "./src/config/security";

const isProduction = process.env.NODE_ENV === "production";
const hasGoogleAnalytics = Boolean(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim(),
);

function contentSecurityPolicy(directives: Record<string, string[]>) {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

const sharedSecurityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000",
        },
      ]
    : []),
];

const publicContentSecurityPolicy = contentSecurityPolicy({
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "frame-ancestors": sanityStudioFrameAncestors(
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    isProduction,
  ),
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
    ...(hasGoogleAnalytics ? ["https://www.googletagmanager.com"] : []),
    "https://va.vercel-scripts.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://cdn.sanity.io",
    "https://*.sanity.io",
    ...(hasGoogleAnalytics ? ["https://*.google-analytics.com"] : []),
  ],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    "https://*.sanity.io",
    "https://*.api.sanity.io",
    "https://*.apicdn.sanity.io",
    ...(hasGoogleAnalytics ? ["https://*.google-analytics.com"] : []),
    "https://va.vercel-scripts.com",
    "https://*.vercel-insights.com",
  ],
  "frame-src": ["'self'"],
  "form-action": ["'self'"],
  "manifest-src": ["'self'"],
  "worker-src": ["'self'", "blob:"],
});

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    default: sanityCacheLife,
  },
  poweredByHeader: false,
  typedRoutes: true,
  experimental: {
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...sharedSecurityHeaders,
          {
            key: "Content-Security-Policy",
            value: publicContentSecurityPolicy,
          },
        ],
      },
    ];
  },
  images: {
    qualities: [75],
    remotePatterns: sanityImageRemotePatterns(),
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
