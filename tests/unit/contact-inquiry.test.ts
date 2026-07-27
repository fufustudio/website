import { describe, expect, it } from "vitest";
import {
  inquiryFieldLimits,
  normalizeInquirySubmissionId,
  validateInquiry,
  validateInquiryDetails,
  type ContactInquiry,
} from "@/contracts/contact";

const validInquiry: ContactInquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  interest: "Strategy",
  message: "Please tell me more.",
};

describe("contact inquiry validation", () => {
  it("shares one valid contract between the form and route", () => {
    expect(validateInquiryDetails(validInquiry)).toBeNull();
    expect(validateInquiry(validInquiry)).toBeNull();
  });

  it("returns field-specific required errors with the public summary", () => {
    const validation = validateInquiryDetails({
      name: "",
      email: "",
      interest: "",
      message: "",
    });

    expect(validation).toEqual({
      message: "Please share your name, email, and a short message.",
      fieldErrors: {
        name: "Name is required.",
        email: "Email address is required.",
        message: "Message is required.",
      },
    });
  });

  it("reports the exact field whose shared limit was exceeded", () => {
    const validation = validateInquiryDetails({
      ...validInquiry,
      message: "x".repeat(inquiryFieldLimits.message + 1),
    });

    expect(validation).toEqual({
      message: "Please shorten your message and try again.",
      fieldErrors: {
        message: `Message must be ${inquiryFieldLimits.message} characters or fewer.`,
      },
    });
    expect(
      validateInquiry({
        ...validInquiry,
        message: "x".repeat(inquiryFieldLimits.message + 1),
      }),
    ).toBe("Please shorten your message and try again.");
  });

  it("accepts UUID submission IDs and rejects untrusted correlation values", () => {
    expect(
      normalizeInquirySubmissionId(" 123E4567-E89B-42D3-A456-426614174000 "),
    ).toBe("123e4567-e89b-42d3-a456-426614174000");
    expect(normalizeInquirySubmissionId("contact/ada@example.com")).toBeNull();
    expect(normalizeInquirySubmissionId(null)).toBeNull();
  });
});
