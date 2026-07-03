"use client";

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
  email: 254,
  message: 500,
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
    const message = String(formData.get("message") ?? "").trim();

    if (
      email.length > fieldLimits.email ||
      message.length > fieldLimits.message
    ) {
      setState({
        status: "error",
        message: "Please shorten your message and try again.",
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
        body: JSON.stringify({ email, message, source: "home" }),
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

      <div className={styles.row}>
        <div className={styles.fields}>
          <FormField
            id="contact-email"
            name="email"
            type="email"
            required
            label="Email"
            placeholder="Email"
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
            label="Message"
            placeholder="Message"
            maxLength={fieldLimits.message}
            className={styles.field}
            disabled={pending}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses("primary", styles.submit)}
        >
          {pending ? "Sending..." : "Send"}
        </button>
      </div>

      {state.status === "success" ? (
        <p className={styles.success} role="status">
          Message sent.
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className={styles.error}>{state.message}</p>
      ) : null}
    </form>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
