import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/"];

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

test("home exposes the message form", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /hello world/i }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: /message/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});
