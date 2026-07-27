// @vitest-environment jsdom

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../setup/dom";
import { ContactForm } from "@/components/contact-form";

const { trackMock } = vi.hoisted(() => ({
  trackMock: vi.fn(),
}));

vi.mock("@/analytics/track-event", () => ({
  trackEvent: trackMock,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ContactForm", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    trackMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports validation errors, focuses the first invalid field, and skips the request", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please share your name, email, and a short message.",
    );
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits valid data, exposes pending state, resets the form, and tracks success", async () => {
    const user = userEvent.setup();
    let resolveRequest: ((value: unknown) => void) | undefined;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<ContactForm />);

    const name = screen.getByRole("textbox", { name: "Name" });
    const email = screen.getByRole("textbox", { name: "Email address" });
    const message = screen.getByRole("textbox", { name: "Message" });

    await user.type(name, "Ada Lovelace");
    await user.type(email, "ada@example.com");
    await user.type(message, "Please tell me more about the project.");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByRole("status")).toHaveTextContent("Sending message…");
    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
    );
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      interest: "",
      message: "Please tell me more about the project.",
      submissionId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    });

    resolveRequest?.({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Message sent.");
    });
    expect(name).toHaveValue("");
    expect(email).toHaveValue("");
    expect(message).toHaveValue("");
    expect(trackMock).toHaveBeenCalledWith("inquiry_submitted", {
      form_id: "contact",
      placement: "homepage",
    });
    expect(trackMock).toHaveBeenCalledTimes(1);
  });

  it("reuses a submission ID for an unchanged retry and rotates it after editing", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Temporary failure" }),
    });
    render(<ContactForm />);

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "ada@example.com",
    );
    const message = screen.getByRole("textbox", { name: "Message" });
    await user.type(message, "Please tell me more.");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByRole("alert");

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const firstBody = requestBodyAt(fetchMock, 0);
    const retryBody = requestBodyAt(fetchMock, 1);
    expect(retryBody.submissionId).toBe(firstBody.submissionId);

    await user.type(message, " Thanks.");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const editedBody = requestBodyAt(fetchMock, 2);
    expect(editedBody.submissionId).not.toBe(firstBody.submissionId);
  });
});

function requestBodyAt(fetchMock: ReturnType<typeof vi.fn>, index: number) {
  const request = fetchMock.mock.calls[index]?.[1] as RequestInit;
  return JSON.parse(String(request.body)) as { submissionId: string };
}
