import { ImageResponse } from "next/og";
import { getCleanSiteSettings } from "@/data/site-settings";
import { theme } from "@/config/theme";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fufu Studio website preview";

export default async function OgImage() {
  const siteSettings = await getCleanSiteSettings();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "100px",
        backgroundColor: theme.bg,
        color: theme.fg,
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ fontSize: 84, letterSpacing: 0 }}>{siteSettings.name}</div>
      <div
        style={{
          maxWidth: 820,
          fontSize: 32,
          marginTop: 24,
          color: theme.accent,
          lineHeight: 1.3,
        }}
      >
        {siteSettings.tagline}
      </div>
    </div>,
    size,
  );
}
