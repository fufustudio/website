# Design System

The starter provides a restrained layout and styling contract, not a finished brand.

## Theme Tokens

Edit the `:root` token contract in `src/app/(site)/globals.css` for shared
colors, typography, spacing, sizing, radii, motion, and layout values. Mirror
core colors in `src/config/theme.ts` for OpenGraph image generation.

Components should reference semantic variables such as `var(--color-feature)`,
`var(--color-accent)`, `var(--color-light)`, and `var(--color-muted)`. Do not
scatter raw hex values through components.

## Current Styling Stack

The baseline uses native CSS: a small reset and semantic custom properties in
`globals.css`, with component selectors and local layout in colocated CSS
Modules. The project does not use Tailwind or a PostCSS utility layer.

Promote a value to `:root` when it represents a shared design decision. Keep a
selector in a CSS Module when it describes only one component's structure,
state, or responsive behavior. Components may expose narrowly scoped custom
properties such as `--heading-color` when a parent needs to change a primitive's
appearance without adding another variant.

Route-local CSS Modules may use descriptive names such as `page.module.css` and
`layout.module.css`. Each reusable component owns a folder containing
`index.tsx` and, when local styles are needed, `styles.module.css`.

## Typography

Fonts are loaded in `src/app/(site)/layout.tsx`. Project routes should use:

- `Heading` with its `as` prop for semantic heading levels, its `size` prop for
  visual hierarchy, and its `tone` prop for contextual color.
- `Eyebrow` for small section labels, including its mono and tone variants.
- top-level typography variables from `globals.css` in component CSS Modules
  for body-copy treatments.
- component CSS modules for local adjustments.

Do not choose a heading level for its appearance; semantic level and visual
size are separate. Do not scale font size directly with viewport width. Keep
letter spacing at `0` unless a compact label style explicitly needs spacing.

## Layout

Default composition:

```tsx
<Section size="default" tone="default">
  <Container size="xl" className="site-grid">
    ...
  </Container>
</Section>
```

- `Section` owns vertical rhythm and tone.
- `Container` owns gutters and max width.
- `site-grid` keeps cross-page alignment consistent.
- Reusable component folders own their CSS modules when local styles are needed.
- Section recipe extension props are limited to outer section class, container
  class, and section size. Use them to fit project composition, not as a
  substitute for route-local CSS or new repeated recipes.

Use `docs/component-registry.md` with `docs/design-to-site.md` when translating a design into starter primitives.

## Buttons And Links

Use `Button`, `ButtonLink`, and `buttonClasses()` for button-like CTAs,
`ActionGroup` for section CTA rows with optional analytics events, and
`TextLink` for inline navigation. Shared link props use `PatternHref` so typed
routes, URL objects, hash links, and external URL strings work consistently. Add
a new shared button variant only when multiple surfaces need it.

## Responsive Rules

- Start single-column.
- Collapse complex grids at `md` unless the component documents another breakpoint.
- Keep tap targets comfortable.
- Do not rely on hover for essential information.
- Preserve `prefers-reduced-motion` behavior for any animation.
