# Component Registry

Use this registry when deciding whether a design should use UI primitives,
section recipes, route-local code, or new shared components. Prefer existing
patterns before creating new shared UI.

Selection order:

1. Use UI primitives for page structure and repeated controls.
2. Use section recipes for recognizable brochure, service, and content sections.
3. Use a feature for route/domain composition and behavior.
4. Add a new shared component only when the pattern repeats or owns behavior.

## Layout

- `Section` owns vertical rhythm, tone, and major page bands.
- `Container` owns gutters and max width.
- `site-grid` and `grid-*` helpers own cross-page alignment.
- Section recipes expose `className`, `containerClassName`, and `sectionSize`
  for project composition only. Prefer route-local CSS for one-off visual
  deviations instead of growing recipe props.
- Page-specific CSS Modules own unusual composition that appears on one route.
- Add a new layout component only when the same structure appears on multiple
  routes or sections.

## Page Headers And Section Copy

- `PageHeader` is for route-level titles and intros.
- `SectionHeading` is for reusable section labels, headings, and intro copy.
- `Heading` is the low-level semantic heading primitive. Choose `as` for
  document structure, `size` for visual scale, and `tone` for context.
- `Eyebrow` owns the shared sans/mono label treatment and tone variants.
- Component CSS Modules use the top-level typography variables for body copy.
- Raw headings are reserved for non-browser output such as HTML email, where
  site CSS Modules are unavailable.

## Buttons And Links

- Use `buttonClasses()` for button-like CTAs.
- Use `Button` and `ButtonLink` when a reusable primitive is clearer than a
  raw element plus classes.
- Use `ActionGroup` for section-level CTA lists, especially when analytics
  events are attached.
- Use `TrackedLink` only when a standalone non-button link needs analytics.
- Use `TextLink` for inline or understated navigation.
- Reusable link props should use the shared `PatternHref` shape so typed routes,
  URL objects, hash links, and external URL strings are accepted consistently.
- Add a new button variant only when more than one surface needs it.

## Section Recipes

Use `docs/pattern-library.md` for detailed APIs.
That file also records when to add optional libraries such as Radix, React Aria,
CVA, or a styled UI kit.

- `HeroSection` is for first-screen route intros.
- `SplitSection` is for repeated media-and-copy sections.
- `CardGridSection` is for services, values, resources, and feature lists.
- `StepsSection` is for process and how-it-works content.
- `StatsSection` is for compact proof points.
- `FaqSection` is for native disclosure-based question lists.
- `CtaSection` is for focused conversion bands.
- `RichTextSection` wraps Sanity or local Portable Text body copy.

## Media

- Use `next/image` for meaningful images.
- Use `BackgroundImageLayer` for Sanity-backed cover imagery with hotspot and
  blur support.
- Use `ImageFrame` for stable recipe-level image regions.
- Use `PatternImage` pass-through fields for quality, blur placeholders, and
  object position before introducing recipe-specific image props.
- Use stable dimensions, `aspect-ratio`, or constrained wrappers for fixed
  media regions.
- Keep SVG icons in components only when they are part of a reusable UI
  primitive; otherwise export assets intentionally.

## Forms

- Use `FormField` for reusable field labeling, descriptions, errors, and
  accessible described-by wiring.
- Keep provider-specific submission behavior in the owning feature unless
  multiple domains share the provider.
- Preserve honeypots, validation, success/error states, and analytics events.

## Content Boundaries

- Use `src/content` for local defaults and reused copy.
- Use `src/data` for server-only content fetching, generated-query result
  normalization, and local fallback selection.
- Use `src/config` for site rendering helpers such as SEO, image handling,
  class names, and the Open Graph theme.
- Use `src/sanity` for the shared web Sanity client, live integration, and
  generated-type bridge. Keep site GROQ queries in `src/data/queries`.
- Use `studio` for schemas, authoring structure, and Studio-specific scripts.
- Use `src/components/layout` for reusable page-section layouts,
  shared site chrome, and root-mounted analytics.
- Keep page composition and one-route behavior in that route's `components`
  folder. Introduce `features` only for substantial behavior shared across routes.
- Use `src/components/navigation.ts` for site navigation; `src/config` owns
  runtime-wide configuration consumed by pages, APIs, and metadata.
- Keep one-off page copy in a route only when it will not be reused or edited in
  Sanity.

## When To Create A New Component

Create a new shared component when:

- the design repeats the pattern in at least two places.
- the pattern has meaningful behavior, state, or accessibility requirements.
- a component makes a data boundary clearer.
- the component belongs to the starter as a reusable implementation pattern.

Keep code route-local when:

- the layout appears once.
- the styling depends heavily on a single page composition.
- extracting it would create a generic wrapper with no reusable behavior.

Create or extend a feature when a route has substantial composition, domain
behavior, client state, validation, or server integrations. Do not create empty
feature folders for routes a client does not ship.
