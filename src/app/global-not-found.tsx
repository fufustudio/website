import type { Metadata } from "next";
import { fontVariables } from "@/config/fonts";
import { NotFoundPage } from "@/page-modules/not-found";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main>
          <NotFoundPage />
        </main>
      </body>
    </html>
  );
}
