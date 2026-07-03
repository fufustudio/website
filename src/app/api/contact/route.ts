import { Resend } from "resend";
import { ContactNotificationEmail } from "@/components/email/contact-notification";
import { optionalEnvValue } from "@/lib/env";

type InquiryPayload = {
  email?: unknown;
  message?: unknown;
  source?: unknown;
  company?: unknown;
  botcheck?: unknown;
};

type Inquiry = {
  email: string;
  message: string;
  source: string;
};

const fieldLimits = {
  email: 254,
  message: 500,
  source: 80,
};

const destinationEmail = "hello@fufu.studio";
const emailError = "Please enter a valid email address.";
const validationError = "Please enter a short message.";
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
  const toEmail =
    optionalEnvValue(process.env.RESEND_TO_EMAIL) ?? destinationEmail;

  if (!apiKey || !fromEmail) {
    return contactResponse(false, configError, 500);
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: inquiry.email,
      subject: "New website contact",
      text: inquiryText(inquiry),
      react: ContactNotificationEmail(inquiry),
    });

    if (error) {
      throw new Error(error.message);
    }

    return contactResponse(true, undefined, 200, data?.id);
  } catch (error) {
    console.error("[contact] Resend provider error:", error);
    return contactResponse(false, providerError, 502);
  }
}

function contactResponse(
  success: boolean,
  message?: string,
  status = 200,
  id?: string,
) {
  return Response.json(
    { success, ...(message ? { message } : {}), ...(id ? { id } : {}) },
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
    email: normalizeField(payload.email).toLowerCase(),
    message: normalizeField(payload.message),
    source: normalizeField(payload.source) || "home",
  };
}

function normalizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateInquiry(inquiry: Inquiry) {
  if (
    inquiry.email.length > fieldLimits.email ||
    inquiry.message.length > fieldLimits.message ||
    inquiry.source.length > fieldLimits.source
  ) {
    return lengthError;
  }

  if (!isValidEmail(inquiry.email)) {
    return emailError;
  }

  if (!inquiry.message) {
    return validationError;
  }

  return null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function inquiryText(inquiry: Inquiry) {
  return [
    `Email: ${inquiry.email}`,
    `Message: ${inquiry.message}`,
    `Source: ${inquiry.source}`,
  ].join("\n");
}
