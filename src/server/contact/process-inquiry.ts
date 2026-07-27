import "server-only";

import type { ContactInquiry } from "@/contracts/contact";
import { captureInquiryInAttio } from "./destinations/attio-crm";
import { sendInquiryNotification } from "./destinations/resend-notification";
import type { InquiryContext } from "./inquiry-context";

export type ProcessInquiryResult =
  | {
      success: true;
      submissionId: string;
      captured: true;
      notified: boolean;
    }
  | {
      success: false;
      submissionId: string;
      captured: false;
      notified: false;
      reason: "configuration";
      missingEnvVars: string[];
    }
  | {
      success: false;
      submissionId: string;
      captured: false;
      notified: false;
      reason: "provider";
    };

export async function processInquiry(
  inquiry: ContactInquiry,
  context: InquiryContext,
): Promise<ProcessInquiryResult> {
  const capture = await captureInquiryInAttio(inquiry, context);

  if (!capture.success) {
    return {
      ...capture,
      submissionId: context.submissionId,
      captured: false,
      notified: false,
    };
  }

  const notification = await sendInquiryNotification(inquiry, context);

  if (capture.enabled) {
    if (!notification.success) {
      const detail =
        notification.reason === "configuration"
          ? `missing ${notification.missingEnvVars.join(", ")}`
          : "provider failure";
      console.error(
        `[contact] Inquiry ${context.submissionId} was captured in Attio but its Resend notification failed: ${detail}.`,
      );
    }

    return {
      success: true,
      submissionId: context.submissionId,
      captured: true,
      notified: notification.success,
    };
  }

  if (!notification.success) {
    return {
      ...notification,
      submissionId: context.submissionId,
      captured: false,
      notified: false,
    };
  }

  return {
    success: true,
    submissionId: context.submissionId,
    captured: true,
    notified: true,
  };
}
