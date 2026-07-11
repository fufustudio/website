"use client";

import { useEffect } from "react";
import { ErrorContent } from "@/components/layout/error-content";
import { fontVariables } from "@/config/fonts";
import "./(site)/globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[global] Unhandled application error", error);
  }, [error]);

  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main>
          <ErrorContent retry={unstable_retry} />
        </main>
      </body>
    </html>
  );
}
