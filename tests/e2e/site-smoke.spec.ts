import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/example", "/contact"];

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

test("mobile menu exposes starter navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();

  const primaryNav = page.getByLabel("Mobile primary navigation");

  await expect(primaryNav.getByRole("link", { name: "Example" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Contact" })).toBeVisible();
});

test("example route exposes pattern gallery interactions", async ({ page }) => {
  await page.goto("/example");

  await expect(
    page.getByRole("heading", { name: /Reusable sections/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "HeroSection" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Contact pattern" }),
  ).toBeVisible();

  await page.getByText("Should every section use these recipes?").click();
  await expect(
    page.getByText(/A one-off composition can stay route-local/i),
  ).toBeVisible();
});
