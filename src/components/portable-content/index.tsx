import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import { Heading } from "@/components/heading";
import type { SimplePortableText } from "@/sanity/types";

export type PortableTextValue = SimplePortableText;

const allowedHrefProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

export function portableTextHref(href: unknown) {
  if (typeof href !== "string") return null;

  const trimmedHref = href.trim();
  if (!trimmedHref) return null;

  try {
    const parsedUrl = new URL(trimmedHref, "https://fufu.local");
    if (!allowedHrefProtocols.has(parsedUrl.protocol)) return null;
    return trimmedHref;
  } catch {
    return null;
  }
}

export function isExternalPortableTextHref(href: string) {
  return /^(https?:)?\/\//i.test(href);
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <Heading as="h1" size="section">
        {children}
      </Heading>
    ),
    h2: ({ children }) => (
      <Heading as="h2" size="module">
        {children}
      </Heading>
    ),
    h3: ({ children }) => (
      <Heading as="h3" size="item">
        {children}
      </Heading>
    ),
    h4: ({ children }) => (
      <Heading as="h4" size="item">
        {children}
      </Heading>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = portableTextHref(value?.href);
      if (!href) return <>{children}</>;

      return (
        <a
          href={href}
          rel={isExternalPortableTextHref(href) ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

export function PortableContent({
  value,
  className,
}: {
  value?: PortableTextValue | null;
  className?: string;
}) {
  if (!value?.length) return null;

  return (
    <div className={className}>
      <PortableText
        value={value as unknown as PortableTextBlock[]}
        components={components}
      />
    </div>
  );
}
