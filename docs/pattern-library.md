# Pattern Library

Fufu Pattern Layer V1 is a source-owned recipe set for basic brochure,
service, and content sites. It lives in this starter so agents can read,
modify, and extend the code directly.

Like a source-owned component catalog, the recipes are installed as editable
starting points rather than as a runtime package. The starter demo does not need
to render every recipe. Keep broadly useful patterns available, then adapt or
remove them deliberately once a client design establishes the real component set.

Use this as the detailed API/reference for section recipes and optional
UI-library policy.

## Rules

- Prefer primitives, then section recipes, then page-module CSS, then new shared
  components.
- Keep recipe props semantic: heading, intro, items, actions, image.
- Keep recipes and CTA groups as Server Components. `TrackedLink` is the small
  client boundary for typed canonical analytics events.
- Do not add a generic Sanity page-builder schema for these recipes. Model
  client content semantically, then render through the recipes.
- Do not add Radix, React Aria, CVA, or styled UI kits by
  default. Add them only when the project has one of the concrete needs listed
  in Optional Libraries.

## Shared Types

Shared recipe types live in `src/components/pattern-types.ts`.

```ts
type PatternHref = LinkProps<string>["href"] | string;

type PatternAction = {
  label: React.ReactNode;
  href: PatternHref;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  analytics?: AnalyticsEvent;
  external?: boolean;
  ariaLabel?: string;
};

type PatternImage = {
  src: ImageProps["src"];
  alt: string;
  sizes?: string;
  preload?: boolean;
  quality?: number;
  placeholder?: ImageProps["placeholder"];
  blurDataURL?: string;
  objectPosition?: string;
};
```

## UI Primitives

- `Heading` separates semantic heading level from the shared display, section,
  module, and item scales.
- `Eyebrow` owns compact uppercase labels with sans/mono and tone variants.
- `Button`, `ButtonLink`, and `buttonClasses()` share the same variants and
  sizes.
- `ActionGroup` renders section CTAs and dispatches typed `analytics` events
  when present.
  Use `PatternHref` anywhere a reusable component accepts internal typed
  routes, URL objects, hash links, or external URL strings.
- `TrackedLink` is the low-level client bridge for analytics-tracked links.
- `ImageFrame` provides stable `next/image` regions with `landscape`,
  `portrait`, `square`, and `wide` aspect options. `PatternImage` can pass
  through image quality, placeholders, blur data URLs, and object position.

## Source Taxonomy

- `src/components`: a flat catalog of low-level primitives, section recipes,
  behavior, and shared site chrome.
- `src/components/pattern-types.ts`: shared recipe prop types.
- `src/page-modules`: page compositions that consume the reusable catalog.
- `src/app/(site)/**/page.tsx`: public-site URL definitions and thin route adapters.

Every shared React component owns a kebab-case folder, with `index.tsx` and an
optional colocated `styles.module.css`. For example, `hero-section/index.tsx`
and `hero-section/styles.module.css` travel together as one component unit.
Shared type modules remain directly under `src/components`. Page modules use the
same `index.tsx` plus optional `styles.module.css` pairing.

## Section Recipes

- All section recipes accept `className?`, `containerClassName?`, and
  `sectionSize?` for project composition. Use these sparingly for layout
  integration; do not add one-off visual prop variants when page-module CSS
  would be clearer.
- `HeroSection`: `eyebrow?`, `heading`, `intro?`, `actions?`, `image?`,
  `layout?: "text" | "split" | "background"`, `tone?`,
  `align?: "left" | "center"`.
- `SplitSection`: `eyebrow?`, `heading`, `intro?`, `body?`, `actions?`,
  `image?`, `imagePosition?: "start" | "end"`, `tone?`.
- `CardGridSection`: `eyebrow?`, `heading`, `intro?`, `items`,
  `columns?: 2 | 3 | 4`, `tone?`. Items support `title`, `body?`, `href?`,
  `actionLabel?`, `external?`, `analytics?`, `ariaLabel?`, `icon?`, and
  `image?`.
- `StepsSection`: `eyebrow?`, `heading`, `intro?`, `items`,
  `layout?: "stack" | "grid"`, `tone?`. Items support `title` and `body?`.
- `StatsSection`: `eyebrow?`, `heading?`, `intro?`, `items`, `tone?`. Items
  support `value`, `label`, and `detail?`.
- `FaqSection`: `eyebrow?`, `heading`, `intro?`, `items`, `tone?`. Items
  support `question` and `answer`.
- `CtaSection`: `eyebrow?`, `heading`, `intro?`, `actions?`, `image?`,
  `layout?: "center" | "split" | "background"`,
  `tone?: "feature" | "contrast"`.
- `RichTextSection`: `eyebrow?`, `heading?`, `content`,
  `width?: "sm" | "md" | "lg"`, `tone?`.

## When Not To Use A Recipe

- The design has a one-off composition that is unlikely to repeat.
- The section requires project-specific behavior, such as filtering, auth,
  checkout, or complex state.
- A native element already solves the problem locally with less code.
- The component would need layout-specific prop names like `redButton` or
  `threeColumnHomepageGrid`.

## Headless Library Policy

- Add Radix only for dialog, dropdown, popover, tooltip, select, tabs, menu, or
  focus-trapped overlays.
- Add React Aria only for combobox, date picker, table/grid selection,
  internationalized inputs, or app/dashboard interfaces.
- Keep `lucide-react` as the default icon source for public-site icons.

## Optional Libraries

The starter intentionally ships without a large interaction or styling stack.
Basic sites mostly need semantic HTML, Server Components, `next/image`, CSS
Modules, tokens, forms, links, and a few repeatable section recipes.

Add these libraries only when their specific value is needed:

- Radix: accessible unstyled primitives for custom dialogs, dropdowns, popovers,
  tooltips, selects, tabs, menus, and focus-trapped overlays.
- React Aria: advanced accessible behavior for app-like controls such as
  comboboxes, date pickers, collection/table selection, drag and drop,
  internationalized inputs, and complex keyboard interaction.
- CVA: typed class variant composition when a component has many meaningful
  variants, sizes, states, or compound variants that outgrow simple maps.
- Styled UI kit: useful for dashboards or admin apps where speed and dense
  widgets matter more than bespoke brand expression.

Do not add these for ordinary brochure sections, static FAQ lists, contact
forms, image/text layouts, card grids, stats, CTA bands, or simple navigation.
