import { CursorBubble } from "@/components/site/cursor-bubble";
import { HashScrollLink } from "@/components/site/hash-scroll-link";
import { LetteredHeroTitle } from "@/components/site/lettered-hero-title";
import { OrganicColorField } from "@/components/site/organic-color-field";
import { SectionMarker } from "@/components/site/section-marker";
import { ServicesExplorer } from "@/components/site/services-explorer";
import { TeamMemberCard } from "@/components/site/team-member-card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getHomePage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { MessageForm } from "./message-form";
import styles from "./styles.module.css";

export async function generateMetadata() {
  const page = await getHomePage();

  return pageMetadata({
    title: page.title,
    description: page.description,
    path: "/",
  });
}

export default async function Home() {
  const page = await getHomePage();

  return (
    <>
      <CursorBubble />
      <Section size="page" className={styles.hero}>
        <OrganicColorField />
        <Container size="xl" className={styles.heroInner}>
          <LetteredHeroTitle text={page.title} />
          <p className={styles.heroBody}>{page.description}</p>
          <HashScrollLink
            href={page.heroCta.href as `#${string}`}
            size="sm"
            className={styles.heroCta}
          >
            {page.heroCta.label}
          </HashScrollLink>
        </Container>
      </Section>

      <Section id="ethos" size="spacious" className={styles.section}>
        <Container size="xl">
          <SectionMarker>{page.ethos.eyebrow}</SectionMarker>
          <h2 className={styles.sectionHeading}>
            Look as good online as you feel in{" "}
            <span className={styles.italic}>real life</span>
          </h2>
          <div className={styles.ethosGrid}>
            {page.ethos.items.map((item) => (
              <article key={item.tag} className={styles.ethosItem}>
                <p className={styles.kicker}>{item.tag}</p>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="services" size="spacious" className={styles.section}>
        <Container size="xl">
          <SectionMarker>{page.services.eyebrow}</SectionMarker>
          <h2 className={styles.sectionHeading}>
            Design and development,{" "}
            <span className={styles.italic}>end-to-end</span>
          </h2>
          <p className={styles.sectionIntro}>{page.services.intro}</p>
          <ServicesExplorer services={page.services.items} />
        </Container>
      </Section>

      <Section id="about" size="spacious" className={styles.section}>
        <Container size="xl">
          <SectionMarker>{page.about.eyebrow}</SectionMarker>
          <h2 className={styles.sectionHeading}>
            Your team of <span className={styles.italic}>two</span>
          </h2>
          <p className={styles.sectionIntro}>{page.about.intro}</p>
          <div className={styles.teamGrid}>
            {page.about.people.map((person) => (
              <TeamMemberCard key={person.name} {...person} />
            ))}
          </div>
        </Container>
      </Section>

      <Section
        id="contact"
        tone="contrast"
        size="spacious"
        className={styles.contact}
      >
        <OrganicColorField tone="dark" variant="footer" />
        <Container size="xl" className={styles.contactGrid}>
          <div className={styles.contactCopy}>
            <h2 className={styles.contactHeading}>
              Let&apos;s make
              <br />
              something
            </h2>
            <p>{page.contact.intro}</p>
            <a href={`mailto:${page.contact.email}`} className={styles.email}>
              {page.contact.email}
            </a>
          </div>
          <MessageForm />
        </Container>
      </Section>
    </>
  );
}
