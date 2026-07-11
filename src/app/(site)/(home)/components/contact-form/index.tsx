"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { track } from "@vercel/analytics";
import { buttonClasses } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  inquiryFieldLimits,
  isHoneypotSubmission,
  normalizeInquiry,
  validateInquiryDetails,
  type InquiryField,
  type InquiryFieldErrors,
} from "@/contracts/contact";
import { cn } from "@/config/cn";
import styles from "./styles.module.css";

type InquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: InquiryFieldErrors;
};

const noteId = "contact-form-note";
const fieldOrder: InquiryField[] = ["name", "email", "interest", "message"];

export function ContactForm({ note }: { note?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<InquiryState>({ status: "idle" });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    formRef.current?.setAttribute("data-hydrated", "true");
  }, []);

  useEffect(() => {
    if (state.status === "success") track("inquiry_submitted");
  }, [state.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (isHoneypotSubmission(Object.fromEntries(formData))) {
      return;
    }

    const inquiry = normalizeInquiry(Object.fromEntries(formData));
    const validation = validateInquiryDetails(inquiry);

    if (validation) {
      setState({
        status: "error",
        message: validation.message,
        fieldErrors: validation.fieldErrors,
      });
      focusFirstInvalidField(form, validation.fieldErrors);
      return;
    }

    setState({ status: "idle" });
    setPending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(inquiry),
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
            : "Something went wrong sending your message. Please try again after the provider is configured.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={styles.root}
      noValidate
      aria-busy={pending}
    >
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

      <div className={cn(styles.fields, pending && styles.pending)}>
        <FormField
          id="contact-name"
          name="name"
          required
          label="Name"
          placeholder="Name*"
          maxLength={inquiryFieldLimits.name}
          error={state.fieldErrors?.name}
          disabled={pending}
          className={styles.field}
        />
        <FormField
          id="contact-email"
          type="email"
          name="email"
          required
          label="Email address"
          placeholder="Email address*"
          maxLength={inquiryFieldLimits.email}
          error={state.fieldErrors?.email}
          disabled={pending}
          className={styles.field}
        />
        <FormField
          id="contact-interest"
          name="interest"
          label="Interest"
          placeholder="What are you interested in?"
          maxLength={inquiryFieldLimits.interest}
          error={state.fieldErrors?.interest}
          disabled={pending}
          className={styles.field}
        />
        <FormField
          id="contact-message"
          name="message"
          rows={6}
          required
          label="Message"
          aria-describedby={note ? noteId : undefined}
          placeholder="Short message*"
          maxLength={inquiryFieldLimits.message}
          error={state.fieldErrors?.message}
          disabled={pending}
          className={cn(styles.field, styles.textarea)}
          multiline
        />
      </div>

      {note ? (
        <p id={noteId} className={styles.note}>
          {note}
        </p>
      ) : null}

      {pending ? (
        <p className={styles.note} role="status">
          Sending message…
        </p>
      ) : state.status === "success" ? (
        <p className={styles.success} role="status">
          Message sent.
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <p className={styles.privacyNotice}>
        By submitting this form, you agree that we may use your information to
        respond to your inquiry. See our{" "}
        <Link href="/privacy" className={styles.privacyLink}>
          Privacy Policy
        </Link>
        .
      </p>

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("primary", styles.submit)}
      >
        {pending ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}

function focusFirstInvalidField(
  form: HTMLFormElement,
  fieldErrors: InquiryFieldErrors,
) {
  const firstInvalidField = fieldOrder.find((field) => fieldErrors[field]);
  if (!firstInvalidField) return;

  const control = form.elements.namedItem(firstInvalidField);
  if (control instanceof HTMLElement) control.focus();
}
