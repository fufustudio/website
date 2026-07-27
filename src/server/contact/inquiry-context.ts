import "server-only";

import { randomUUID } from "node:crypto";
import { normalizeInquirySubmissionId } from "@/contracts/contact";

export type InquiryContext = {
  submissionId: string;
  receivedAt: string;
  source: {
    formId: "contact";
    placement: "homepage";
  };
};

export function createInquiryContext(submissionId: unknown): InquiryContext {
  return {
    submissionId: normalizeInquirySubmissionId(submissionId) ?? randomUUID(),
    receivedAt: new Date().toISOString(),
    source: {
      formId: "contact",
      placement: "homepage",
    },
  };
}
