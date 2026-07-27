// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../setup/dom";
import {
  analyticsConsentStorageKey,
  clearAnalyticsConsent,
  getAnalyticsConsentSnapshot,
} from "@/analytics/consent";
import { AnalyticsConsentManager } from "@/components/analytics-consent-manager";
import { AnalyticsPreferencesButton } from "@/components/analytics-preferences-button";

const { googleAnalyticsMock } = vi.hoisted(() => ({
  googleAnalyticsMock: vi.fn(({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics" data-ga-id={gaId} />
  )),
}));

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: googleAnalyticsMock,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AnalyticsConsentManager", () => {
  const gtag = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    clearAnalyticsConsent();
    googleAnalyticsMock.mockClear();
    gtag.mockClear();
    window.gtag = gtag;
  });

  it("blocks Google and offers balanced first-visit choices", async () => {
    render(
      <AnalyticsConsentManager
        gaId="G-TEST"
        consentMode="basic"
        vercelAnalyticsEnabled
      />,
    );

    expect(
      await screen.findByRole("region", { name: "Optional analytics" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Allow analytics" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Decline" })).toBeVisible();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("persists acceptance, updates Google consent, and loads GA4", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticsConsentManager
        gaId="G-TEST"
        consentMode="basic"
        vercelAnalyticsEnabled
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: "Allow analytics" }),
    );

    expect(
      JSON.parse(window.localStorage.getItem(analyticsConsentStorageKey) ?? ""),
    ).toEqual({ version: 1, analytics: "granted" });
    expect(gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted" }),
    );
    expect(await screen.findByTestId("google-analytics")).toHaveAttribute(
      "data-ga-id",
      "G-TEST",
    );
  });

  it("persists decline without loading Google", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticsConsentManager
        gaId="G-TEST"
        consentMode="basic"
        vercelAnalyticsEnabled
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Decline" }));

    expect(
      JSON.parse(window.localStorage.getItem(analyticsConsentStorageKey) ?? ""),
    ).toEqual({ version: 1, analytics: "denied" });
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Optional analytics" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a session-only choice when browser storage is unavailable", async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "SecurityError");
    });

    render(
      <AnalyticsConsentManager
        gaId="G-TEST"
        consentMode="basic"
        vercelAnalyticsEnabled
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Decline" }));

    expect(getAnalyticsConsentSnapshot()).toBe("denied");
    expect(
      screen.queryByRole("region", { name: "Optional analytics" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("reopens preferences and restores focus when closed", async () => {
    const user = userEvent.setup();
    render(
      <>
        <AnalyticsConsentManager
          gaId="G-TEST"
          consentMode="basic"
          vercelAnalyticsEnabled
        />
        <AnalyticsPreferencesButton />
      </>,
    );

    await user.click(await screen.findByRole("button", { name: "Decline" }));
    const preferences = screen.getByRole("button", {
      name: "Analytics preferences",
    });
    await user.click(preferences);

    const panel = screen.getByRole("region", {
      name: "Optional analytics",
    });
    await waitFor(() => expect(panel).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(preferences).toHaveFocus();
  });

  it("loads Google immediately without showing consent controls", () => {
    render(
      <AnalyticsConsentManager
        gaId="G-TEST"
        consentMode="immediate"
        vercelAnalyticsEnabled
      />,
    );

    expect(screen.getByTestId("google-analytics")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Optional analytics" }),
    ).not.toBeInTheDocument();
  });

  it("applies a granted preference received from another tab", async () => {
    render(
      <AnalyticsConsentManager
        gaId="G-TEST"
        consentMode="basic"
        vercelAnalyticsEnabled
      />,
    );
    await screen.findByRole("region", { name: "Optional analytics" });

    const value = JSON.stringify({ version: 1, analytics: "granted" });
    window.localStorage.setItem(analyticsConsentStorageKey, value);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: analyticsConsentStorageKey,
        newValue: value,
      }),
    );

    expect(await screen.findByTestId("google-analytics")).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted" }),
    );
  });
});
