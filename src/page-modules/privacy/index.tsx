import { Container } from "@/components/container";
import { Heading } from "@/components/heading";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { Section } from "@/components/section";
import { TextLink } from "@/components/text-link";
import { type PrivacyContent } from "@/content/privacy";
import styles from "./styles.module.css";

interface Props {
  privacyContent: PrivacyContent;
}

export function PrivacyPage({ privacyContent }: Props) {
  const { effectiveDate, businessName, contactEmail, sections, providers } =
    privacyContent;
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacy"
        heading="Privacy Policy"
        intro="How Fufu Studio collects, uses, and protects information submitted through this website."
        sectionSize="page"
      />

      <Section size="compact">
        <Container size="md">
          <div className={styles.notice}>
            <p>
              Effective date: <strong>{effectiveDate}</strong>
            </p>
            <p>
              Operator: <strong>{businessName}</strong>
            </p>
            <p>
              Privacy contact: <strong>{contactEmail}</strong>
            </p>
          </div>
        </Container>
      </Section>

      <Section size="default" className={styles.policySection}>
        <Container size="md" className={styles.content}>
          {sections.map((section) => (
            <section key={section.title} className={styles.block}>
              <Heading as="h2" size="module" className={styles.blockHeading}>
                {section.title}
              </Heading>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.title === "Service Providers" ? (
                <ul className={styles.providerList}>
                  {providers.map((provider) => (
                    <li key={provider}>{provider}</li>
                  ))}
                </ul>
              ) : null}
              {section.links?.length ? (
                <ul className={styles.linkList}>
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <TextLink href={link.href} external direction="none">
                        {link.label}
                      </TextLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </Container>
      </Section>
    </PageShell>
  );
}
