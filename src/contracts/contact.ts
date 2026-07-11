export type ContactInquiryPayload = {
  name?: unknown;
  email?: unknown;
  interest?: unknown;
  message?: unknown;
  company?: unknown;
  botcheck?: unknown;
};

export type ContactInquiry = {
  name: string;
  email: string;
  interest: string;
  message: string;
};

export const inquiryFieldLimits = {
  name: 120,
  email: 254,
  interest: 160,
  message: 3000,
} as const;

export type InquiryField = keyof typeof inquiryFieldLimits;
export type InquiryFieldErrors = Partial<Record<InquiryField, string>>;

export const inquiryErrors = {
  invalid: "Please share your name, email, and a short message.",
  email: "Please enter a valid email address.",
  length: "Please shorten your message and try again.",
} as const;

export function isContactInquiryPayload(
  value: unknown,
): value is ContactInquiryPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isHoneypotSubmission(payload: ContactInquiryPayload) {
  return (
    normalizeField(payload.company).length > 0 ||
    payload.botcheck === true ||
    payload.botcheck === "on" ||
    payload.botcheck === "true"
  );
}

export function normalizeInquiry(
  payload: ContactInquiryPayload,
): ContactInquiry {
  return {
    name: normalizeField(payload.name),
    email: normalizeField(payload.email),
    interest: normalizeField(payload.interest),
    message: normalizeField(payload.message),
  };
}

export function validateInquiry(inquiry: ContactInquiry) {
  return validateInquiryDetails(inquiry)?.message ?? null;
}

export function validateInquiryDetails(inquiry: ContactInquiry) {
  const fieldErrors: InquiryFieldErrors = {};

  for (const field of Object.keys(inquiryFieldLimits) as InquiryField[]) {
    const limit = inquiryFieldLimits[field];
    if (inquiry[field].length > limit) {
      fieldErrors[field] =
        `${fieldLabel(field)} must be ${limit} characters or fewer.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: inquiryErrors.length, fieldErrors };
  }

  if (!inquiry.name || !inquiry.email || !inquiry.message) {
    if (!inquiry.name) fieldErrors.name = "Name is required.";
    if (!inquiry.email) fieldErrors.email = "Email address is required.";
    if (!inquiry.message) fieldErrors.message = "Message is required.";
    return { message: inquiryErrors.invalid, fieldErrors };
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inquiry.email)) {
    return {
      message: inquiryErrors.email,
      fieldErrors: { email: inquiryErrors.email },
    };
  }

  return null;
}

function normalizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function fieldLabel(field: InquiryField) {
  if (field === "email") return "Email address";
  return `${field.charAt(0).toUpperCase()}${field.slice(1)}`;
}
