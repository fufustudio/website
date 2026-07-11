import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { fontVariables } from "@/config/fonts";
import "./(site)/globals.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main>
          <NotFoundContent />
        </main>
      </body>
    </html>
  );
}
