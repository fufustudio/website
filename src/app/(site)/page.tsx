import { Container } from "@/components/ui/container";
import { HeaderSentinel } from "@/components/site/header-sentinel";
import { PageShell } from "@/components/ui/page-shell";
import { PortableContent } from "@/components/ui/portable-content";
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
    <PageShell>
      <Section size="page" className={styles.hero}>
        <Container size="xl" className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <p className="eyebrow">Fufu</p>
            <h1 className={styles.heroHeading}>{page.title}</h1>
            {page.description ? (
              <p className={styles.heroBody}>{page.description}</p>
            ) : null}
            <PortableContent value={page.body} className={styles.body} />
            <div className={styles.formWrap}>
              <MessageForm />
            </div>
          </div>
        </Container>
      </Section>
      <HeaderSentinel />
    </PageShell>
  );
}
