"use client";

import { useEffect, useRef, useState } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, PatternHref } from "@/components/types";
import { Container } from "@/components/container";
import { cn } from "@/config/cn";
import styles from "@/components/site-header/styles.module.css";

const MOBILE_MENU_EXIT_MS = 460;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function normalizePathname(pathname: string) {
  return pathname === "/" ? pathname : pathname.replace(/\/$/, "");
}

function hrefPathname(href: PatternHref) {
  if (typeof href === "string") return href.split(/[?#]/)[0] || "/";
  return typeof href.pathname === "string" ? href.pathname : "";
}

function isActivePath(pathname: string, href: string) {
  return (
    Boolean(href) && (pathname === href || pathname.startsWith(`${href}/`))
  );
}

export function HeaderNav({ navItems }: { navItems: readonly NavItem[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuVisible ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuVisible]);

  useEffect(() => {
    if (menuOpen || !menuVisible) return;

    const timeout = window.setTimeout(() => {
      setMenuVisible(false);
    }, MOBILE_MENU_EXIT_MS);

    return () => window.clearTimeout(timeout);
  }, [menuOpen, menuVisible]);

  useEffect(() => {
    if (!menuOpen) return;

    const background = [
      document.querySelector<HTMLElement>("main"),
      document.querySelector<HTMLElement>("footer"),
    ].filter((element): element is HTMLElement => element !== null);
    const panel = menuPanelRef.current;
    const menuButton = menuButtonRef.current;
    const panelControls = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    const focusCycle = menuButton
      ? [...panelControls, menuButton]
      : panelControls;

    for (const element of background) element.inert = true;
    panelControls[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButton?.focus();
        return;
      }

      if (event.key !== "Tab" || focusCycle.length === 0) return;

      event.preventDefault();
      const currentIndex = focusCycle.indexOf(
        document.activeElement as HTMLElement,
      );
      const direction = event.shiftKey ? -1 : 1;
      const nextIndex =
        currentIndex === -1
          ? 0
          : (currentIndex + direction + focusCycle.length) % focusCycle.length;

      focusCycle[nextIndex]?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      for (const element of background) element.inert = false;
    };
  }, [menuOpen]);

  const normalizedPathname = normalizePathname(pathname);
  const openMobileMenu = () => {
    setMenuVisible(true);
    window.requestAnimationFrame(() => setMenuOpen(true));
  };
  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <>
      <nav aria-label="Primary navigation" className={styles.desktopNav}>
        {navItems.map((item) => {
          const href = hrefPathname(item.href);
          const active = isActivePath(normalizedPathname, href);

          return (
            <Link
              key={item.label}
              href={item.href as LinkProps<string>["href"]}
              aria-current={active ? "page" : undefined}
              className={cn(styles.desktopLink, active && styles.activeLink)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        ref={menuButtonRef}
        type="button"
        aria-label={menuVisible ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        className={styles.menuButton}
        onClick={menuVisible ? closeMobileMenu : openMobileMenu}
      >
        {menuVisible ? "Close" : "Menu"}
      </button>

      {menuVisible ? (
        <div
          ref={menuPanelRef}
          id="mobile-navigation"
          role="dialog"
          aria-label="Navigation menu"
          aria-modal="true"
          className={cn(
            styles.panel,
            styles.solidOverlay,
            menuOpen ? styles.panelOpen : styles.panelClosing,
          )}
        >
          <Container size="xl" className={styles.mobileContainer}>
            <nav
              aria-label="Mobile primary navigation"
              className={styles.primaryNav}
            >
              {navItems.map((item) => {
                const href = hrefPathname(item.href);
                const active = isActivePath(normalizedPathname, href);

                return (
                  <Link
                    key={item.label}
                    href={item.href as LinkProps<string>["href"]}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMobileMenu}
                    className={cn(
                      styles.item,
                      styles.primaryItem,
                      active && styles.activePrimaryDark,
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </Container>
        </div>
      ) : null}
    </>
  );
}
