import { Container } from "@/components/ui/container";
import { DividerGrid } from "@/components/ui/divider-grid";
import { HeaderSentinel } from "@/components/site/header-sentinel";
import { PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ActionGroup } from "@/components/ui/action-group";
import { home } from "@/content/home";
import styles from "./styles.module.css";

export default function Home() {
  return (
    <PageShell>
      <Section size="page" className={styles.hero}>
        <Container size="xl" className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <p className="eyebrow">{home.eyebrow}</p>
            <h1 className={styles.heroHeading}>{home.heading}</h1>
            <p className={styles.heroBody}>{home.intro}</p>
            <ActionGroup
              actions={[
                {
                  label: home.primaryCta,
                  href: "/example",
                  event: "primary_cta_click",
                },
                {
                  label: home.secondaryCta,
                  href: "/contact",
                  variant: "ghost",
                },
              ]}
              className={styles.actions}
            />
          </div>
        </Container>
      </Section>
      <HeaderSentinel />

      <Section size="default">
        <Container size="xl" className={styles.sectionGrid}>
          <SectionHeading
            eyebrow="Project Defaults"
            heading="Keep the reusable conventions. Delete the rest."
            intro="The starter is intentionally sparse so a new repo begins with structure instead of cleanup."
            className={styles.sectionIntro}
          />
          <DividerGrid itemClassName={styles.principleItem}>
            {home.principles.map((item) => (
              <div key={item.title}>
                <h2 className={styles.principleTitle}>{item.title}</h2>
                <p className={styles.principleBody}>{item.body}</p>
              </div>
            ))}
          </DividerGrid>
        </Container>
      </Section>
    </PageShell>
  );
}
