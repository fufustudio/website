# Performance

The starter keeps performance work straightforward by starting with minimal content and no heavy visual assets.

## Rendering And Caching

- Cache Components is enabled so stable page shells and published content can
  be prerendered while request-bound draft behavior remains dynamic.
- The default cache profile comes from `next-sanity`; Sanity Live revalidates
  registered published queries after content changes.
- Time-dependent values must live inside a Cache Component or follow a request
  boundary. The footer year uses a one-day cache instead of making the whole
  layout dynamic.
- Keep `cookies()`, `headers()`, Draft Mode, and other request APIs out of
  cached functions. Resolve them first and pass only the needed values inward.

## Images

- Use `next/image` for meaningful images and above-the-fold media.
- Use `BackgroundImageLayer` only when a project needs cover-style responsive imagery.
- Avoid large CSS background images.
- Provide useful alt text for meaningful images.
- Keep Next.js's built-in image optimizer as the provider-neutral default.
- Sanity image URLs are allowed through `images.remotePatterns`; query image
  metadata, LQIP, crop, and hotspot data, then pass accurate `sizes` values so
  Next.js requests the smallest useful rendition.
- The allowlist is scoped to the configured Sanity project and dataset. Next.js
  owns the final responsive resize, quality, and browser-format conversion.
- Remove temporary local copies of client content images after the Sanity assets
  are uploaded and wired into the page.

## Layout Stability

- Give fixed-format media stable dimensions.
- Avoid swapping form states with wildly different heights.
- Reserve space for interactive elements that appear after hydration.

## Verification

Sanity Live uses its v13 stale-while-revalidate behavior for published content.
This keeps the starter lighter than a guaranteed global invalidation pipeline;
add a Sync Tag Invalidate Function only when a project requires every public
visitor and upstream CDN to update immediately after publication.

```bash
npm run verify:release
```

Use Lighthouse results as a signal, then confirm real pages manually on mobile and desktop.

The release gate fails below 0.85 performance, 0.9 best practices, or 0.95
accessibility/SEO. Treat higher scores as the target without making normal
measurement variance block every build.
