"use client";

import { ErrorPage } from "@/page-modules/error";

export default function SiteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorPage error={error} retry={unstable_retry} scope="site" />;
}
