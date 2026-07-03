import { Resend } from "resend";
import { optionalEnvValue } from "@/lib/env";

type InquiryPayload = {
  name?: unknown;
  email?: unknown;
  interest?: unknown;
  message?: unknown;
  company?: unknown;
  botcheck?: unknown;
};

type Inquiry = {
  name: string;
  email: string;
  interest: string;
  message: string;
};

const fieldLimits = {
  name: 120,
  email: 254,
  interest: 160,
  message: 3000,
};

const validationError = "Please share your name, email, and a short message.";
const emailError = "Please enter a valid email address.";
const lengthError = "Please shorten your message and try again.";
const configError =
  "The form provider is not configured yet. Add the required Resend environment variables.";
const providerError =
  "Something went wrong sending your message. Please try again after the provider is configured.";

export async function POST(request: Request) {
  let payload: InquiryPayload;

  try {
    payload = (await request.json()) as InquiryPayload;
  } catch {
    return contactResponse(false, validationError, 400);
  }

  if (isHoneypotSubmission(payload)) {
    return contactResponse(true);
  }

  const inquiry = normalizeInquiry(payload);
  const validation = validateInquiry(inquiry);

  if (validation) {
    return contactResponse(false, validation, 400);
  }

  const apiKey = optionalEnvValue(process.env.RESEND_API_KEY);
  const fromEmail = optionalEnvValue(process.env.RESEND_FROM_EMAIL);
  const toEmail = optionalEnvValue(process.env.RESEND_TO_EMAIL);

  if (!apiKey || !fromEmail || !toEmail) {
    return contactResponse(false, configError, 500);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New website inquiry - ${inquiry.name}`,
      replyTo: inquiry.email,
      text: inquiryText(inquiry),
      html: inquiryHtml(inquiry),
    });

    if (error) {
      throw new Error(error.message);
    }

    return contactResponse(true);
  } catch (error) {
    console.error("[contact] Resend provider error:", error);
    return contactResponse(false, providerError, 502);
  }
}

function contactResponse(success: boolean, message?: string, status = 200) {
  return Response.json(
    { success, ...(message ? { message } : {}) },
    { status },
  );
}

function isHoneypotSubmission(payload: InquiryPayload) {
  return (
    normalizeField(payload.company).length > 0 ||
    payload.botcheck === true ||
    payload.botcheck === "on" ||
    payload.botcheck === "true"
  );
}

function normalizeInquiry(payload: InquiryPayload): Inquiry {
  return {
    name: normalizeField(payload.name),
    email: normalizeField(payload.email),
    interest: normalizeField(payload.interest),
    message: normalizeField(payload.message),
  };
}

function normalizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateInquiry(inquiry: Inquiry) {
  if (
    inquiry.name.length > fieldLimits.name ||
    inquiry.email.length > fieldLimits.email ||
    inquiry.interest.length > fieldLimits.interest ||
    inquiry.message.length > fieldLimits.message
  ) {
    return lengthError;
  }

  if (!inquiry.name || !inquiry.email || !inquiry.message) {
    return validationError;
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inquiry.email)) {
    return emailError;
  }

  return null;
}

function inquiryText(inquiry: Inquiry) {
  return [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Interest: ${inquiry.interest || "-"}`,
    "",
    "Message:",
    inquiry.message,
  ].join("\n");
}

function inquiryHtml(inquiry: Inquiry) {
  return [
    "<h1>New website inquiry</h1>",
    "<dl>",
    `<dt>Name</dt><dd>${escapeHtml(inquiry.name)}</dd>`,
    `<dt>Email</dt><dd>${escapeHtml(inquiry.email)}</dd>`,
    `<dt>Interest</dt><dd>${escapeHtml(inquiry.interest || "-")}</dd>`,
    "</dl>",
    "<h2>Message</h2>",
    `<p>${escapeHtml(inquiry.message).replace(/\n/g, "<br />")}</p>`,
  ].join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
