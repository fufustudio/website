import {
  inquiryErrors,
  isContactInquiryPayload,
  isHoneypotSubmission,
  normalizeInquiry,
  validateInquiry,
} from "@/contracts/contact";
import { createInquiryContext } from "@/server/contact/inquiry-context";
import { processInquiry } from "@/server/contact/process-inquiry";
import { checkContactRateLimit } from "@/server/contact/rate-limit";
import { readJsonBody } from "@/server/contact/read-json-body";

const deliveryError = "We could not send your message. Please try again later.";

export async function POST(request: Request) {
  const rateLimit = await checkContactRateLimit(request);

  if (rateLimit.status === "unavailable") {
    console.error(
      `[contact] Missing rate-limit configuration: ${rateLimit.missingEnvVars.join(", ")}`,
    );
    return contactResponse(false, deliveryError, 503);
  }

  if (rateLimit.status === "limited") {
    return contactResponse(
      false,
      "Too many requests. Please wait and try again.",
      429,
      { "Retry-After": String(rateLimit.retryAfter) },
    );
  }

  const body = await readJsonBody(request);

  if (!body.ok && body.reason === "unsupported-media") {
    return contactResponse(false, "Send this form as JSON.", 415);
  }

  if (!body.ok && body.reason === "too-large") {
    return contactResponse(false, "The request is too large.", 413);
  }

  if (!body.ok) {
    return contactResponse(false, inquiryErrors.invalid, 400);
  }

  if (!isContactInquiryPayload(body.value)) {
    return contactResponse(false, inquiryErrors.invalid, 400);
  }

  const payload = body.value;

  if (isHoneypotSubmission(payload)) {
    return contactResponse(true);
  }

  const inquiry = normalizeInquiry(payload);
  const validation = validateInquiry(inquiry);

  if (validation) {
    return contactResponse(false, validation, 400);
  }

  const context = createInquiryContext(payload.submissionId);
  const processing = await processInquiry(inquiry, context);

  if (!processing.success && processing.reason === "configuration") {
    console.error(
      `[contact] Missing provider configuration: ${processing.missingEnvVars.join(", ")}`,
    );
    return contactResponse(false, deliveryError, 503);
  }

  if (!processing.success) {
    return contactResponse(false, deliveryError, 502);
  }

  return contactResponse(true);
}

function contactResponse(
  success: boolean,
  message?: string,
  status = 200,
  headers?: HeadersInit,
) {
  return Response.json(
    { success, ...(message ? { message } : {}) },
    { status, headers },
  );
}
