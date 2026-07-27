import { ActionGroup } from "@/components/action-group";
import { ContactForm } from "@/components/contact-form";
import { Container } from "@/components/container";
import { DividerGrid } from "@/components/divider-grid";
import { Eyebrow } from "@/components/eyebrow";
import { Heading } from "@/components/heading";
import { PageShell } from "@/components/page-shell";
import { PortableContent } from "@/components/portable-content";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { home } from "@/content/home";
import type { HomePageContent } from "@/data/home-page";
import styles from "./styles.module.css";

export function HomePage({ content }: { content: HomePageContent }) {
  return (
    <PageShell>
      <Section size="page" className={styles.hero}>
        <Container size="xl" className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <Eyebrow>{home.eyebrow}</Eyebrow>
            <Heading as="h1" className={styles.heroHeading}>
              {content.title}
            </Heading>
            {content.intro ? (
              <p className={styles.heroBody}>{content.intro}</p>
            ) : null}
            <ActionGroup
              actions={[
                {
                  label: home.primaryCta,
                  href: "#foundation",
                  analytics: {
                    name: "cta_clicked",
                    properties: {
                      cta_id: "foundation",
                      placement: "hero",
                    },
                  },
                },
                {
                  label: home.secondaryCta,
                  href: "#message",
                  variant: "ghost",
                },
              ]}
              className={styles.actions}
            />
          </div>
        </Container>
      </Section>

      <Section id="foundation" size="default">
        <Container size="xl" className={styles.sectionGrid}>
          <SectionHeading
            eyebrow="Foundation"
            heading="A simple structure for the next design."
            intro="The interim site keeps the essential content and contact paths in place while the new direction is developed."
            className={styles.sectionIntro}
          />
          {content.body?.length ? (
            <PortableContent value={content.body} className={styles.homeBody} />
          ) : (
            <DividerGrid itemClassName={styles.principleItem}>
              {home.principles.map((item) => (
                <div key={item.title}>
                  <Heading
                    as="h2"
                    size="item"
                    className={styles.principleTitle}
                  >
                    {item.title}
                  </Heading>
                  <p className={styles.principleBody}>{item.body}</p>
                </div>
              ))}
            </DividerGrid>
          )}
        </Container>
      </Section>

      <Section
        id="message"
        tone="contrast"
        size="default"
        className={styles.contact}
      >
        <Container size="xl" className={styles.contactGrid}>
          <div className={styles.contactCopy}>
            <Eyebrow tone="light">{home.contactEyebrow}</Eyebrow>
            <Heading as="h2" tone="light" className={styles.contactHeading}>
              {home.contactHeading}
            </Heading>
            <p className={styles.contactIntro}>{home.contactIntro}</p>
          </div>
          <div className={styles.formColumn}>
            <ContactForm note={home.contactFormNote} />
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
