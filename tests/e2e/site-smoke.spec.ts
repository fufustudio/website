import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const routes = ["/", "/privacy"];

test.describe("public routes", () => {
  for (const route of routes) {
    test(`${route} renders without critical accessibility violations`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        `,
      });

      const results = await new AxeBuilder({ page }).analyze();

      expect(results.violations).toEqual([]);
    });
  }
});

test("home route exposes the reusable message form", async ({ page }) => {
  await gotoHydratedHome(page);
  const form = contactForm(page);

  await expect(
    page.getByRole("heading", { name: /start a conversation/i }),
  ).toBeVisible();
  await expect(form.getByLabel("Name")).toBeVisible();
  await expect(form.getByLabel("Email address")).toBeVisible();
  await expect(form.getByLabel("Message")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Privacy Policy" }),
  ).toHaveAttribute("href", "/privacy");
  await expect(
    page
      .getByRole("navigation", { name: "Footer navigation" })
      .getByRole("link", { name: "Privacy", exact: true }),
  ).toHaveAttribute("href", "/privacy");
});

test("the skip link moves keyboard users to main content", async ({ page }) => {
  await gotoHydratedHome(page);
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("unknown routes use the global branded not-found page", async ({
  page,
}) => {
  const response = await page.goto("/this-route-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page is not available." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute(
    "href",
    "/",
  );
});

test("the embedded Studio route is no longer available", async ({ page }) => {
  const response = await page.goto("/studio");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page is not available." }),
  ).toBeVisible();
});

test("mobile navigation contains focus and restores it on close", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chrome",
    "The full-screen menu is mobile-only.",
  );

  await gotoHydratedHome(page);
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Navigation menu" });
  const privacyLink = dialog.getByRole("link", { name: "Privacy" });
  await expect(dialog).toBeVisible();
  await expect(privacyLink).toBeFocused();
  await expect(page.locator("main")).toHaveAttribute("inert", "");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(privacyLink).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
});

test("contact form connects validation errors to fields", async ({ page }) => {
  await gotoHydratedHome(page);
  const form = contactForm(page);

  await form.getByRole("button", { name: "Submit" }).click();

  await expect(form.getByRole("alert")).toHaveText(
    "Please share your name, email, and a short message.",
  );
  await expect(page.getByLabel("Name")).toBeFocused();
  await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#contact-name-error")).toHaveText(
    "Name is required.",
  );
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "aria-describedby",
    /contact-email-error/,
  );
});

test("contact form announces pending and successful submission", async ({
  page,
}) => {
  await page.route("**/api/contact", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
  await gotoHydratedHome(page);
  const form = contactForm(page);
  await fillContactForm(page);

  await form.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByRole("status")).toHaveText("Sending message…");
  await expect(page.getByRole("button", { name: "Sending..." })).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("Message sent.");
  await expect(page.getByLabel("Name")).toHaveValue("");
});

test("contact form announces a safe API error", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "We could not send your message. Please try again.",
      }),
    });
  });
  await gotoHydratedHome(page);
  const form = contactForm(page);
  await fillContactForm(page);

  await form.getByRole("button", { name: "Submit" }).click();

  await expect(form.getByRole("alert")).toHaveText(
    "We could not send your message. Please try again.",
  );
  await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();
});

test("sitemap includes the privacy route", async ({ page }) => {
  const response = await page.goto("/sitemap.xml");
  expect(response?.ok()).toBe(true);
  await expect(page.locator("body")).toContainText("/privacy");
});

async function fillContactForm(page: Page) {
  const form = contactForm(page);
  await form.getByLabel("Name").fill("Ada Lovelace");
  await form.getByLabel("Email address").fill("ada@example.com");
  await form.getByLabel("Message").fill("Please tell me more.");
}

function contactForm(page: Page) {
  return page.locator('form[data-hydrated="true"]');
}

async function gotoHydratedHome(page: Page) {
  await page.goto("/");
  await expect(contactForm(page)).toBeVisible();
}
