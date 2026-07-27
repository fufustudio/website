"use client";

import { useEffect } from "react";
import { ErrorContent } from "@/components/error-content";

export function ErrorPage({
  error,
  retry,
  scope,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  scope: "global" | "site";
}) {
  useEffect(() => {
    console.error(`[${scope}] Unhandled route error`, error);
  }, [error, scope]);

  return <ErrorContent retry={retry} />;
}
