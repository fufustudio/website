import type { ImageProps } from "next/image";

export type ResponsiveImageContent = {
  src: ImageProps["src"];
  alt: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: ImageProps["placeholder"];
  blurDataURL?: string;
  objectPosition?: string;
};
