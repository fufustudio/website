import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const consentStorageKey = "fufu.analytics-consent.v1";
const isAnalyticsBuild = process.env.ANALYTICS_E2E === "true";

test.describe("optional Google Analytics consent", () => {
  test.skip(
    !isAnalyticsBuild,
    "Run npm run test:e2e:analytics against its dedicated GA-enabled build.",
  );

  test.beforeEach(async ({ page }) => {
    await page.route("https://www.googletagmanager.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "",
      });
    });
  });

  test("blocks Google before a choice and keeps Vercel mounted", async ({
    page,
  }) => {
    const googleRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().startsWith("https://www.googletagmanager.com/")) {
        googleRequests.push(request.url());
      }
    });

    await page.goto("/");
    await expect(
      page.getByRole("region", { name: "Optional analytics" }),
    ).toBeVisible();
    await expect(
      page.locator('script[src*="/_vercel/insights/script.js"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('script[src*="googletagmanager.com"]'),
    ).toHaveCount(0);
    expect(googleRequests).toEqual([]);
  });

  test("persists decline across navigation and reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Decline" }).click();
    await expect(
      page.getByRole("region", { name: "Optional analytics" }),
    ).toHaveCount(0);

    await page.goto("/privacy");
    await page.reload();

    await expect(
      page.getByRole("region", { name: "Optional analytics" }),
    ).toHaveCount(0);
    await expect(
      page.locator('script[src*="googletagmanager.com"]'),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        (key) => window.localStorage.getItem(key),
        consentStorageKey,
      ),
    ).toBe(JSON.stringify({ version: 1, analytics: "denied" }));
  });

  test("loads Google after acceptance and supports keyboard-accessible withdrawal", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Allow analytics" }).click();

    await expect(
      page.locator('script[src*="googletagmanager.com"]'),
    ).toHaveCount(1);
    expect(
      await page.evaluate(
        (key) => window.localStorage.getItem(key),
        consentStorageKey,
      ),
    ).toBe(JSON.stringify({ version: 1, analytics: "granted" }));

    const preferences = page.getByRole("button", {
      name: "Analytics preferences",
    });
    await preferences.focus();
    await page.keyboard.press("Enter");

    const panel = page.getByRole("region", { name: "Optional analytics" });
    await expect(panel).toBeFocused();
    const accessibility = await new AxeBuilder({ page })
      .include('[aria-labelledby="analytics-consent-heading"]')
      .analyze();
    expect(accessibility.violations).toEqual([]);

    await Promise.all([
      page.waitForNavigation(),
      page.getByRole("button", { name: "Decline" }).click(),
    ]);
    await expect(
      page.locator('script[src*="googletagmanager.com"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('script[src*="/_vercel/insights/script.js"]'),
    ).toHaveCount(1);
    expect(
      await page.evaluate(
        (key) => window.localStorage.getItem(key),
        consentStorageKey,
      ),
    ).toBe(JSON.stringify({ version: 1, analytics: "denied" }));
  });
});
