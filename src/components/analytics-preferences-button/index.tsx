"use client";

import { openAnalyticsPreferences } from "@/analytics/consent";

export function AnalyticsPreferencesButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={openAnalyticsPreferences}
    >
      Analytics preferences
    </button>
  );
}
