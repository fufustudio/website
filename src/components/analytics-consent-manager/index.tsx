"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  analyticsConsentStorageKey,
  analyticsPreferencesOpenEvent,
  getAnalyticsConsentServerSnapshot,
  getAnalyticsConsentSnapshot,
  initializeAnalyticsConsent,
  parseAnalyticsConsent,
  setAnalyticsConsent,
  subscribeToAnalyticsConsent,
} from "@/analytics/consent";
import { updateGoogleConsent } from "@/analytics/google-consent";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import type { GoogleAnalyticsConsentMode } from "@/config/env";
import styles from "./styles.module.css";

export function AnalyticsConsentManager({
  gaId,
  consentMode,
  vercelAnalyticsEnabled,
}: {
  gaId: string;
  consentMode: GoogleAnalyticsConsentMode;
  vercelAnalyticsEnabled: boolean;
}) {
  const consent = useSyncExternalStore(
    subscribeToAnalyticsConsent,
    getAnalyticsConsentSnapshot,
    getAnalyticsConsentServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const focusOnOpenRef = useRef(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const googleLoaded = consentMode === "immediate" || consent === "granted";
  const showPanel =
    consentMode === "basic" && hydrated && (consent === "unknown" || isOpen);

  useEffect(() => {
    initializeAnalyticsConsent();
  }, []);

  useEffect(() => {
    if (consentMode !== "basic") return;

    function openPreferences() {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      focusOnOpenRef.current = true;
      setIsOpen(true);
    }

    function applyConsentFromAnotherTab(event: StorageEvent) {
      if (event.key !== analyticsConsentStorageKey) return;

      const nextConsent = parseAnalyticsConsent(event.newValue);
      if (nextConsent === "granted") updateGoogleConsent("granted");
      if (nextConsent !== "granted") {
        updateGoogleConsent("denied");

        if (document.getElementById("_next-ga")) {
          window.location.reload();
        }
      }
    }

    window.addEventListener(analyticsPreferencesOpenEvent, openPreferences);
    window.addEventListener("storage", applyConsentFromAnotherTab);

    return () => {
      window.removeEventListener(
        analyticsPreferencesOpenEvent,
        openPreferences,
      );
      window.removeEventListener("storage", applyConsentFromAnotherTab);
    };
  }, [consentMode]);

  useEffect(() => {
    if (showPanel && focusOnOpenRef.current) {
      panelRef.current?.focus();
      focusOnOpenRef.current = false;
    }
  }, [showPanel]);

  function closePreferences() {
    setIsOpen(false);
    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }

  function allowAnalytics() {
    updateGoogleConsent("granted");
    setAnalyticsConsent("granted");
    closePreferences();
  }

  function declineAnalytics() {
    const shouldReload = googleLoaded;
    if (shouldReload) updateGoogleConsent("denied");
    setAnalyticsConsent("denied");
    closePreferences();
    if (shouldReload) window.location.reload();
  }

  return (
    <>
      {googleLoaded ? <GoogleAnalytics gaId={gaId} /> : null}

      {showPanel ? (
        <section
          ref={panelRef}
          className={styles.root}
          role="region"
          aria-labelledby="analytics-consent-heading"
          tabIndex={-1}
        >
          <div className={styles.copy}>
            <Heading
              as="h2"
              size="item"
              id="analytics-consent-heading"
              className={styles.heading}
            >
              Optional analytics
            </Heading>
            <p className={styles.body}>
              We use Google Analytics only if you allow it.{" "}
              {vercelAnalyticsEnabled
                ? "Vercel provides cookieless aggregate site measurement regardless of this choice. "
                : ""}
              You can change your preference later.{" "}
              <Link href="/privacy" className={styles.link}>
                Read our privacy policy
              </Link>
              .
            </p>
          </div>

          <div className={styles.actions}>
            <Button type="button" size="sm" onClick={allowAnalytics}>
              Allow analytics
            </Button>
            <Button type="button" size="sm" onClick={declineAnalytics}>
              Decline
            </Button>
            {consent !== "unknown" ? (
              <button
                type="button"
                className={styles.close}
                onClick={closePreferences}
              >
                Close
              </button>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

function emptySubscribe() {
  return () => undefined;
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}
