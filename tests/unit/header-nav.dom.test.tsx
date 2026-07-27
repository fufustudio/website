// @vitest-environment jsdom

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../setup/dom";
import { HeaderNav } from "@/components/site-header-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string };
    children: ReactNode;
  }) => (
    <a
      href={typeof href === "string" ? href : (href.pathname ?? "")}
      {...props}
    >
      {children}
    </a>
  ),
}));

const navItems = [
  { label: "Home", href: "/" },
  { label: "Privacy", href: "/privacy" },
] as const;

describe("HeaderNav", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
  });

  it("marks the current desktop navigation item", () => {
    render(<HeaderNav navItems={navItems} />);

    const desktopNav = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(
      within(desktopNav).getByRole("link", { name: "Home" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(desktopNav).getByRole("link", { name: "Privacy" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("opens an accessible modal menu and restores focus and page interaction on Escape", async () => {
    const user = userEvent.setup();
    render(
      <>
        <main>Page content</main>
        <HeaderNav navItems={navItems} />
        <footer>Footer content</footer>
      </>,
    );

    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "Navigation menu",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getByRole("link", { name: "Home" })).toHaveFocus();
    expect(screen.getByRole("main")).toHaveProperty("inert", true);
    expect(screen.getByRole("contentinfo")).toHaveProperty("inert", true);
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    await user.keyboard("{Escape}");

    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("main")).toHaveProperty("inert", false);
    expect(screen.getByRole("contentinfo")).toHaveProperty("inert", false);
  });
});
