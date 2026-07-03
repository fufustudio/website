import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { HeaderSentinel } from "@/components/site/header-sentinel";
import { PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { pageMetadata } from "@/lib/seo";
import { contact } from "@/content/contact";
import { ContactForm } from "./contact-form";
import styles from "./styles.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "A minimal contact route pattern for the starter.",
  path: "/contact",
});

export default function Contact() {
  return (
    <PageShell>
      <Section size="page" className={styles.header}>
        <Container size="xl" className={styles.grid}>
          <div className={styles.copy}>
            <p className="eyebrow">{contact.eyebrow}</p>
            <h1 className={styles.heading}>{contact.heading}</h1>
            <p className={styles.intro}>{contact.intro}</p>
          </div>

          <div className={styles.formColumn}>
            <ContactForm note={contact.formNote} />
          </div>
        </Container>
      </Section>
      <HeaderSentinel />
    </PageShell>
  );
}
