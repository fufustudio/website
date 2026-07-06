import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { pageMetadata } from "@/lib/seo";
import styles from "./styles.module.css";

const effectiveDate = "July 4, 2026";

export function generateMetadata() {
  return pageMetadata({
    title: "Privacy Policy",
    description:
      "How Fufu Studio collects, uses, and shares information from this website.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacy"
        heading="Privacy Policy"
        intro={`Effective ${effectiveDate}`}
        align="left"
        width="lg"
        headingWidth="lg"
      />
      <Section size="compact">
        <Container size="lg">
          <article className={styles.policy}>
            <PolicySection title="Who We Are">
              <p>
                This website is operated by Fufu Studio LLC. You can contact us
                at <a href="mailto:hello@fufu.studio">hello@fufu.studio</a>.
              </p>
            </PolicySection>

            <PolicySection title="Information We Collect">
              <p>
                We collect information you choose to send through the contact
                form, including your email address, message, and the page or
                source connected with the submission. Spam-prevention fields may
                also be submitted by automated tools.
              </p>
              <p>
                We also receive basic website and analytics information, such as
                pages viewed, analytics events, browser and device information,
                approximate location derived from IP address, referring pages,
                request paths, timestamps, and technical logs.
              </p>
            </PolicySection>

            <PolicySection title="How We Use Information">
              <p>
                We use information to respond to inquiries, provide proposals or
                services, operate and secure the website, debug issues, improve
                site performance and content, measure traffic, and maintain
                business records.
              </p>
            </PolicySection>

            <PolicySection title="Analytics And Cookies">
              <p>
                We use Google Analytics 4, Vercel Analytics, and Vercel Speed
                Insights to understand website traffic and performance. Google
                Analytics may use cookies or similar technologies to collect
                usage data. We do not intentionally send names, email addresses,
                message content, or other contact-form personal information to
                analytics tools.
              </p>
              <p>
                You can learn how Google uses information from sites and apps
                that use its services at{" "}
                <TextLink
                  href="https://policies.google.com/technologies/partner-sites"
                  external
                  direction="none"
                >
                  Google&apos;s partner-sites page
                </TextLink>
                . Google also offers a{" "}
                <TextLink
                  href="https://tools.google.com/dlpage/gaoptout"
                  external
                  direction="none"
                >
                  Google Analytics opt-out browser add-on
                </TextLink>
                .
              </p>
            </PolicySection>

            <PolicySection title="Service Providers">
              <p>
                We use service providers that help us operate the website,
                deliver email, host content, provide analytics, and support
                business communications. These providers include Vercel, Google
                Analytics and Google Workspace, Resend, and Sanity.
              </p>
            </PolicySection>

            <PolicySection title="Contact Form And Email">
              <p>
                Contact form submissions are sent through Resend to
                hello@fufu.studio. Replies may be handled through Google
                Workspace. Please do not send sensitive information through the
                form unless it is needed for your inquiry.
              </p>
            </PolicySection>

            <PolicySection title="Data Sharing">
              <p>
                We do not sell personal information. We may share limited
                information with service providers that help us run the website
                and business, with legal or compliance recipients when required,
                or when needed to protect the website, our business, or others.
              </p>
            </PolicySection>

            <PolicySection title="Retention">
              <p>
                We keep inquiry records and business communications as long as
                reasonably needed to respond, provide services, maintain
                business records, resolve disputes, and meet legal or
                administrative needs.
              </p>
            </PolicySection>

            <PolicySection title="Security">
              <p>
                We use reasonable administrative, technical, and organizational
                safeguards for the information we handle. No method of internet
                transmission or electronic storage is completely secure.
              </p>
            </PolicySection>

            <PolicySection title="Your Choices">
              <p>
                You may contact us at{" "}
                <a href="mailto:hello@fufu.studio">hello@fufu.studio</a> to
                request access, correction, or deletion of information you
                submitted. You can also use browser controls and Google&apos;s
                opt-out tools to manage analytics technologies.
              </p>
            </PolicySection>

            <PolicySection title="Children">
              <p>
                This website is not directed to children under 13, and we do not
                knowingly collect personal information from children under 13.
              </p>
            </PolicySection>

            <PolicySection title="Updates">
              <p>
                We may update this Privacy Policy from time to time. Changes
                will be reflected by updating the effective date above.
              </p>
            </PolicySection>
          </article>
        </Container>
      </Section>
    </PageShell>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      <div className={styles.copy}>{children}</div>
    </section>
  );
}
