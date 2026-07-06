"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { track } from "@vercel/analytics";
import { buttonClasses } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import styles from "./styles.module.css";

type CaptureState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const fieldLimits = {
  name: 120,
  email: 254,
  message: 1200,
};

export function MessageForm() {
  const [state, setState] = useState<CaptureState>({ status: "idle" });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (state.status === "success") track("inquiry_submitted");
  }, [state.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (
      String(formData.get("company") ?? "").trim() ||
      formData.get("botcheck")
    ) {
      return;
    }

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (
      name.length > fieldLimits.name ||
      email.length > fieldLimits.email ||
      message.length > fieldLimits.message
    ) {
      setState({
        status: "error",
        message: "Please shorten your message and try again.",
      });
      return;
    }

    if (!name) {
      setState({
        status: "error",
        message: "Please enter your name.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      setState({
        status: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (!message) {
      setState({
        status: "error",
        message: "Please enter a short message.",
      });
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, message, source: "home" }),
      });
      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        throw new Error(result?.message ?? "Contact submission failed");
      }

      setState({ status: "success" });
      form.reset();
    } catch (error) {
      console.error("[contact] Form provider error:", error);
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong sending your message. Please try again later.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div aria-hidden className={styles.honeypot}>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        <label htmlFor="botcheck">Do not check this box</label>
        <input
          id="botcheck"
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status === "success" ? (
        <div className={styles.successPanel} role="status">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
          >
            <circle
              cx="16"
              cy="16"
              r="15"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m9.5 16.5 4.2 4.2L23 11"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <p>Message sent. We&apos;ll reply within two business days.</p>
        </div>
      ) : (
        <div className={styles.fields}>
          <FormField
            id="contact-name"
            name="name"
            required
            label="Name"
            placeholder="Your name"
            autoComplete="name"
            maxLength={fieldLimits.name}
            className={styles.field}
            disabled={pending}
          />
          <FormField
            id="contact-email"
            name="email"
            type="email"
            required
            label="Email"
            placeholder="Your email address"
            autoComplete="email"
            inputMode="email"
            maxLength={fieldLimits.email}
            className={styles.field}
            disabled={pending}
          />
          <FormField
            id="contact-message"
            name="message"
            required
            multiline
            label="Message"
            placeholder="Tell us about your project - timeline, scope, a link to what you have..."
            maxLength={fieldLimits.message}
            className={styles.field}
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending}
            className={buttonClasses("secondary", styles.submit, "sm")}
          >
            {pending ? "Sending..." : "Send it"}
          </button>
        </div>
      )}

      {state.status === "error" ? (
        <p className={styles.error}>{state.message}</p>
      ) : null}

      <p className={styles.notice}>
        By submitting this form, you agree that we may use your information to
        respond to your inquiry. See our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </form>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
