import type { ProcessInquiryResult } from "@/server/contact/process-inquiry";

const capturedWithoutNotification = {
  success: true,
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  captured: true,
  notified: false,
} satisfies ProcessInquiryResult;

void capturedWithoutNotification;
