import "server-only";

import { Resend } from "resend";
import { optionalEnvValue } from "@/config/env";
import type { ContactInquiry } from "@/contracts/contact";
import { renderContactEmail } from "./contact-email";

type SendInquiryResult =
  | { success: true }
  | {
      success: false;
      reason: "configuration";
      missingEnvVars: string[];
    }
  | { success: false; reason: "provider" };

const providerTimeoutMs = 10_000;

export async function sendInquiry(
  inquiry: ContactInquiry,
): Promise<SendInquiryResult> {
  const env = {
    RESEND_API_KEY: optionalEnvValue(process.env.RESEND_API_KEY),
    RESEND_FROM_EMAIL: optionalEnvValue(process.env.RESEND_FROM_EMAIL),
    RESEND_TO_EMAIL: optionalEnvValue(process.env.RESEND_TO_EMAIL),
  };
  const missingEnvVars = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingEnvVars.length > 0) {
    return { success: false, reason: "configuration", missingEnvVars };
  }

  const apiKey = env.RESEND_API_KEY as string;
  const fromEmail = env.RESEND_FROM_EMAIL as string;
  const toEmail = env.RESEND_TO_EMAIL as string;
  try {
    const html = await renderContactEmail(inquiry);
    const resend = new Resend(apiKey);
    const { error } = await withTimeout(
      resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: "New website contact",
        replyTo: inquiry.email,
        text: inquiryText(inquiry),
        html,
      }),
      providerTimeoutMs,
    );

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    console.error("[contact] Resend provider error:", error);
    return { success: false, reason: "provider" };
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () => reject(new Error("Contact provider request timed out.")),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, deadline]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function inquiryText(inquiry: ContactInquiry) {
  return [
    "New website contact.",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Interest: ${inquiry.interest || "-"}`,
    "",
    "Message:",
    inquiry.message,
  ].join("\n");
}
