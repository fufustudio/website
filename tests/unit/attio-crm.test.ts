import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureInquiryInAttio } from "@/server/contact/destinations/attio-crm";
import type { InquiryContext } from "@/server/contact/inquiry-context";
import type { ContactInquiry } from "@/contracts/contact";

const inquiry: ContactInquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  interest: "Strategy",
  message: "Please tell me more about the project.",
};

const context: InquiryContext = {
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  receivedAt: "2026-07-26T18:30:00.000Z",
  source: {
    formId: "contact",
    placement: "homepage",
  },
};

describe("Attio inquiry capture", () => {
  beforeEach(() => {
    delete process.env.ATTIO_ACCESS_TOKEN;
    delete process.env.ATTIO_INBOUND_LIST_ID;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is disabled without Attio configuration", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(captureInquiryInAttio(inquiry, context)).resolves.toEqual({
      success: true,
      enabled: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports partial configuration without exposing credentials", async () => {
    process.env.ATTIO_ACCESS_TOKEN = "secret-token";

    await expect(captureInquiryInAttio(inquiry, context)).resolves.toEqual({
      success: false,
      reason: "configuration",
      missingEnvVars: ["ATTIO_INBOUND_LIST_ID"],
    });
  });

  it("upserts the person and list entry, then attaches the message as a note", async () => {
    process.env.ATTIO_ACCESS_TOKEN = "secret-token";
    process.env.ATTIO_INBOUND_LIST_ID = "f1c980d3-6adc-459c-b273-5db1b3648696";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ data: { id: { record_id: "person-id" } } }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(
        jsonResponse({ data: { id: { entry_id: "entry-id" } } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: { id: { note_id: "note-id" } } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(captureInquiryInAttio(inquiry, context)).resolves.toEqual({
      success: true,
      enabled: true,
      personRecordId: "person-id",
      listEntryId: "entry-id",
      noteId: "note-id",
      duplicate: false,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.attio.com/v2/objects/people/records?matching_attribute=email_addresses",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer secret-token",
        }),
        body: JSON.stringify({
          data: {
            values: {
              email_addresses: ["ada@example.com"],
              name: [{ full_name: "Ada Lovelace" }],
            },
          },
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://api.attio.com/v2/lists/f1c980d3-6adc-459c-b273-5db1b3648696/entries",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          data: {
            parent_object: "people",
            parent_record_id: "person-id",
            entry_values: {
              status: "New",
              source: "homepage/contact",
              interest: "Strategy",
              submission_id: context.submissionId,
              received_at: context.receivedAt,
            },
          },
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "https://api.attio.com/v2/notes",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(
          `"title":"Website inquiry · ${context.submissionId}"`,
        ),
      }),
    );
    expect(
      (fetchMock.mock.calls[3]?.[1] as RequestInit | undefined)?.body,
    ).toContain("Please tell me more about the project.");
  });

  it("does not create a second note for a retried submission ID", async () => {
    process.env.ATTIO_ACCESS_TOKEN = "secret-token";
    process.env.ATTIO_INBOUND_LIST_ID = "inbound-list";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ data: { id: { record_id: "person-id" } } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [{ title: `Website inquiry · ${context.submissionId}` }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: { id: { entry_id: "entry-id" } } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(captureInquiryInAttio(inquiry, context)).resolves.toEqual({
      success: true,
      enabled: true,
      personRecordId: "person-id",
      listEntryId: "entry-id",
      duplicate: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns a safe provider result when Attio rejects a request", async () => {
    process.env.ATTIO_ACCESS_TOKEN = "secret-token";
    process.env.ATTIO_INBOUND_LIST_ID = "inbound-list";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

    await expect(captureInquiryInAttio(inquiry, context)).resolves.toEqual({
      success: false,
      reason: "provider",
    });
  });
});

function jsonResponse(value: unknown) {
  return Response.json(value);
}
