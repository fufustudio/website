import type { AnalyticsEvent } from "@/analytics/events";
import type { AnalyticsDestination } from "./types";

const badgeStyle = [
  "background:#6d28d9",
  "border-radius:3px",
  "color:#fff",
  "font-weight:600",
  "padding:2px 6px",
].join(";");
const eventStyle = "color:#0f766e;font-weight:600";
const contextStyle = "color:#64748b";

export function logDevelopmentEvent(event: AnalyticsEvent) {
  const context = developmentEventContext(event);

  console.groupCollapsed(
    "%c ANALYTICS %c %s %c %s ",
    badgeStyle,
    eventStyle,
    event.name,
    contextStyle,
    context,
  );
  console.log("Canonical event", event);
  console.table(event.properties);
  console.groupEnd();
}

export const developmentDestination: AnalyticsDestination = {
  id: "development",
  track: logDevelopmentEvent,
};

function developmentEventContext(event: AnalyticsEvent) {
  const properties = event.properties as Record<string, unknown>;
  return typeof properties.placement === "string" ? properties.placement : "";
}
