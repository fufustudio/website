export const analyticsConsentVersion = 1;
export const analyticsConsentStorageKey = `fufu.analytics-consent.v${analyticsConsentVersion}`;
export const analyticsPreferencesOpenEvent = "fufu:analytics-preferences-open";

export type AnalyticsConsent = "unknown" | "granted" | "denied";

type PersistedAnalyticsConsent = {
  version: typeof analyticsConsentVersion;
  analytics: Exclude<AnalyticsConsent, "unknown">;
};

let currentConsent: AnalyticsConsent = "unknown";
let listeningForStorageChanges = false;
const listeners = new Set<() => void>();

export function parseAnalyticsConsent(value: string | null): AnalyticsConsent {
  if (!value) return "unknown";

  try {
    const parsed = JSON.parse(value) as Partial<PersistedAnalyticsConsent>;

    if (
      parsed.version === analyticsConsentVersion &&
      (parsed.analytics === "granted" || parsed.analytics === "denied")
    ) {
      return parsed.analytics;
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}

export function initializeAnalyticsConsent() {
  if (typeof window === "undefined") return;

  updateCurrentConsent(parseAnalyticsConsent(readPersistedConsent()));

  if (!listeningForStorageChanges) {
    window.addEventListener("storage", handleStorageChange);
    listeningForStorageChanges = true;
  }
}

export function setAnalyticsConsent(
  consent: Exclude<AnalyticsConsent, "unknown">,
) {
  if (typeof window !== "undefined") {
    const persisted: PersistedAnalyticsConsent = {
      version: analyticsConsentVersion,
      analytics: consent,
    };

    try {
      window.localStorage.setItem(
        analyticsConsentStorageKey,
        JSON.stringify(persisted),
      );
    } catch {
      // Keep the choice in memory when browser storage is unavailable.
    }
  }

  updateCurrentConsent(consent);
}

export function clearAnalyticsConsent() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(analyticsConsentStorageKey);
    } catch {
      // The in-memory preference can still be reset.
    }
  }

  updateCurrentConsent("unknown");
}

export function getAnalyticsConsentSnapshot() {
  return currentConsent;
}

export function getAnalyticsConsentServerSnapshot(): AnalyticsConsent {
  return "unknown";
}

export function subscribeToAnalyticsConsent(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function openAnalyticsPreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(analyticsPreferencesOpenEvent));
  }
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== analyticsConsentStorageKey) return;
  updateCurrentConsent(parseAnalyticsConsent(event.newValue));
}

function readPersistedConsent() {
  try {
    return window.localStorage.getItem(analyticsConsentStorageKey);
  } catch {
    return null;
  }
}

function updateCurrentConsent(consent: AnalyticsConsent) {
  if (consent === currentConsent) return;
  currentConsent = consent;
  listeners.forEach((listener) => listener());
}
