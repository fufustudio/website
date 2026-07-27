"use client";

import { fontVariables } from "@/config/fonts";
import { ErrorPage } from "@/page-modules/error";
import "@/styles/globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main>
          <ErrorPage error={error} retry={unstable_retry} scope="global" />
        </main>
      </body>
    </html>
  );
}
