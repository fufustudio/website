"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import styles from "./styles.module.css";

export function ErrorContent({ retry }: { retry: () => void }) {
  return (
    <Section size="page">
      <Container size="md">
        <div className={styles.content}>
          <Eyebrow family="mono">Something went wrong</Eyebrow>
          <Heading as="h1" className={styles.heading}>
            This page could not be loaded.
          </Heading>
          <p className={styles.message}>
            The problem may be temporary. Try loading the page again.
          </p>
          <Button type="button" onClick={retry} className={styles.action}>
            Try again
          </Button>
        </div>
      </Container>
    </Section>
  );
}
