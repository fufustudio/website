import type { Metadata } from "next";
import {
  BarChart3,
  CircleHelp,
  LayoutTemplate,
  ListChecks,
  MousePointerClick,
  Rows3,
  Text,
} from "lucide-react";
import { CardGridSection } from "@/components/sections/card-grid-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { RichTextSection } from "@/components/sections/rich-text-section";
import { StatsSection } from "@/components/sections/stats-section";
import { StepsSection } from "@/components/sections/steps-section";
import type { PortableTextValue } from "@/components/ui/portable-content";
import { pageMetadata } from "@/lib/seo";
import { example } from "@/content/example";

export const metadata: Metadata = pageMetadata({
  title: "Example",
  description: "A minimal pattern gallery for the starter.",
  path: "/example",
});

const sectionCards = [
  {
    title: "HeroSection",
    body: "Use for first-screen route intros, with text-only, split, and image-background layouts.",
    icon: <LayoutTemplate aria-hidden />,
  },
  {
    title: "SplitSection",
    body: "Use for about, mission, location, and media-plus-copy sections that repeat across a client build.",
    icon: <Rows3 aria-hidden />,
  },
  {
    title: "CardGridSection",
    body: "Use for services, values, resources, and feature lists before creating a one-off card grid.",
    icon: <MousePointerClick aria-hidden />,
  },
  {
    title: "StepsSection",
    body: "Use for process and how-it-works content with predictable numbering and responsive flow.",
    icon: <ListChecks aria-hidden />,
  },
  {
    title: "StatsSection",
    body: "Use for compact proof points, project facts, and measured outcomes when the design calls for numbers.",
    icon: <BarChart3 aria-hidden />,
  },
  {
    title: "FaqSection",
    body: "Use native disclosure behavior for common questions. Add Radix later only when the interaction needs it.",
    icon: <CircleHelp aria-hidden />,
  },
] as const;

const patternNotes = [
  {
    title: "Start with recipes",
    body: "Map the design to existing section components before adding route-local CSS.",
  },
  {
    title: "Keep content semantic",
    body: "Model Sanity content for the client domain, then render it through these patterns.",
  },
  {
    title: "Add behavior carefully",
    body: "Reach for Radix or React Aria only when native elements cannot handle the interaction well.",
  },
] as const;

const patternStats = [
  {
    value: "8",
    label: "Section recipes",
    detail: "Enough for most brochure, service, and content sites.",
  },
  {
    value: "1",
    label: "New library",
    detail: "Lucide icons only; no styled UI kit in the default starter.",
  },
  {
    value: "0",
    label: "Page builder schemas",
    detail: "Client builds still model content semantically.",
  },
  {
    value: "2",
    label: "Headless options",
    detail: "Radix and React Aria stay opt-in for complex controls.",
  },
] as const;

const faqItems = [
  {
    question: "Should every section use these recipes?",
    answer:
      "No. Use them for repeated, recognizable site sections. A one-off composition can stay route-local.",
  },
  {
    question: "Do these replace client-specific design work?",
    answer:
      "No. They provide structure and accessibility defaults while CSS Modules and tokens carry the project direction.",
  },
] as const;

const richTextContent = [
  {
    _type: "block",
    _key: "pattern-copy",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "pattern-copy-span",
        text: "RichTextSection wraps PortableContent for CMS-authored body copy without making pages own rich text rendering details.",
        marks: [],
      },
    ],
  },
] satisfies PortableTextValue;

export default function ExamplePage() {
  return (
    <>
      <HeroSection
        eyebrow={example.eyebrow}
        heading={example.heading}
        intro={example.intro}
        actions={[
          { label: "Contact pattern", href: "/contact", variant: "primary" },
          { label: "Starter home", href: "/", variant: "ghost" },
        ]}
      />

      <CardGridSection
        eyebrow="Section Recipes"
        heading="Use these before creating new shared layout."
        intro="They keep common site sections easy for agents to compose while leaving visual direction open."
        items={sectionCards}
        columns={3}
      />

      <StepsSection
        eyebrow="Build Flow"
        heading="A simple order keeps the starter from sprawling."
        intro="The recipes are a starting point, not a promise that every project has the same page structure."
        items={patternNotes}
        tone="muted"
      />

      <StatsSection
        eyebrow="V1 Boundaries"
        heading="Opinionated where it helps. Sparse everywhere else."
        items={patternStats}
      />

      <RichTextSection
        eyebrow="CMS Copy"
        heading={
          <>
            <Text aria-hidden /> Rich text stays behind one wrapper.
          </>
        }
        content={richTextContent}
      />

      <FaqSection
        eyebrow="Decision Rules"
        heading="Common questions for future agents."
        intro="These rules should keep implementation fast without turning the starter into a generic website."
        items={faqItems}
      />

      <CtaSection
        eyebrow="Next Pattern"
        heading="Use the contact route as the minimal form example."
        intro="Keep provider-specific behavior close to the route until multiple forms need the same integration."
        actions={[
          { label: "Open contact", href: "/contact", variant: "primary" },
          { label: "Back home", href: "/", variant: "ghost" },
        ]}
      />
    </>
  );
}
