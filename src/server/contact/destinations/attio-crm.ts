import "server-only";

import { optionalEnvValue } from "@/config/env";
import type { ContactInquiry } from "@/contracts/contact";
import type { InquiryContext } from "../inquiry-context";

export type InquiryCaptureResult =
  | { success: true; enabled: false }
  | {
      success: true;
      enabled: true;
      personRecordId: string;
      listEntryId: string;
      noteId?: string;
      duplicate: boolean;
    }
  | {
      success: false;
      reason: "configuration";
      missingEnvVars: string[];
    }
  | { success: false; reason: "provider" };

const attioApiBaseUrl = "https://api.attio.com";
const providerTimeoutMs = 10_000;

export async function captureInquiryInAttio(
  inquiry: ContactInquiry,
  context: InquiryContext,
): Promise<InquiryCaptureResult> {
  const env = {
    ATTIO_ACCESS_TOKEN: optionalEnvValue(process.env.ATTIO_ACCESS_TOKEN),
    ATTIO_INBOUND_LIST_ID: optionalEnvValue(process.env.ATTIO_INBOUND_LIST_ID),
  };
  const configured = Object.values(env).some(Boolean);

  if (!configured) {
    return { success: true, enabled: false };
  }

  const missingEnvVars = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingEnvVars.length > 0) {
    return { success: false, reason: "configuration", missingEnvVars };
  }

  const accessToken = env.ATTIO_ACCESS_TOKEN as string;
  const inboundListId = env.ATTIO_INBOUND_LIST_ID as string;
  const noteTitle = `Website inquiry · ${context.submissionId}`;

  try {
    const person = await attioRequest(
      accessToken,
      "/v2/objects/people/records?matching_attribute=email_addresses",
      {
        method: "PUT",
        body: {
          data: {
            values: {
              email_addresses: [inquiry.email],
              name: [{ full_name: inquiry.name }],
            },
          },
        },
      },
    );
    const personRecordId = nestedId(person, "record_id");

    const notes = await attioRequest(
      accessToken,
      `/v2/notes?limit=50&parent_object=people&parent_record_id=${encodeURIComponent(personRecordId)}`,
    );
    const duplicate = noteExists(notes, noteTitle);

    const listEntry = await attioRequest(
      accessToken,
      `/v2/lists/${encodeURIComponent(inboundListId)}/entries`,
      {
        method: "PUT",
        body: {
          data: {
            parent_object: "people",
            parent_record_id: personRecordId,
            entry_values: {
              status: "New",
              source: `${context.source.placement}/${context.source.formId}`,
              interest: inquiry.interest,
              submission_id: context.submissionId,
              received_at: context.receivedAt,
            },
          },
        },
      },
    );
    const listEntryId = nestedId(listEntry, "entry_id");

    if (duplicate) {
      return {
        success: true,
        enabled: true,
        personRecordId,
        listEntryId,
        duplicate: true,
      };
    }

    const note = await attioRequest(accessToken, "/v2/notes", {
      method: "POST",
      body: {
        data: {
          parent_object: "people",
          parent_record_id: personRecordId,
          title: noteTitle,
          format: "plaintext",
          content: inquiryNote(inquiry, context),
        },
      },
    });

    return {
      success: true,
      enabled: true,
      personRecordId,
      listEntryId,
      noteId: nestedId(note, "note_id"),
      duplicate: false,
    };
  } catch (error) {
    console.error("[contact] Attio provider error:", error);
    return { success: false, reason: "provider" };
  }
}

async function attioRequest(
  accessToken: string,
  path: string,
  init: {
    method?: "GET" | "POST" | "PUT";
    body?: unknown;
  } = {},
) {
  const response = await fetch(`${attioApiBaseUrl}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(providerTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Attio request failed with status ${response.status}.`);
  }

  return response.json() as Promise<unknown>;
}

function nestedId(response: unknown, key: string) {
  if (!isRecord(response) || !isRecord(response.data)) {
    throw new Error(`Attio returned no ${key}.`);
  }

  const id = response.data.id;
  if (!isRecord(id) || typeof id[key] !== "string") {
    throw new Error(`Attio returned no ${key}.`);
  }

  return id[key];
}

function noteExists(response: unknown, title: string) {
  if (
    typeof response !== "object" ||
    response === null ||
    !("data" in response) ||
    !Array.isArray(response.data)
  ) {
    throw new Error("Attio returned an invalid notes response.");
  }

  return response.data.some(
    (note) =>
      typeof note === "object" &&
      note !== null &&
      "title" in note &&
      note.title === title,
  );
}

function inquiryNote(inquiry: ContactInquiry, context: InquiryContext) {
  return [
    "Website contact form submission",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Interest: ${inquiry.interest || "-"}`,
    `Received at: ${context.receivedAt}`,
    `Source: ${context.source.placement}/${context.source.formId}`,
    `Submission ID: ${context.submissionId}`,
    "",
    "Message:",
    inquiry.message,
  ].join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
