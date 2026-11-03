"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useContent } from "../cms/EditorBridge";
import { LanguagePicker } from "./LanguagePicker";
import { Logo } from "./Logo";
import { useStickyHeader } from "./useStickyHeader";

// Each item is its own page; the menu is content (globals/header.json, the section pages).
const trim = (p: string) => p.replace(/\/+$/, "") || "/";

export function Header() {
  const [open, setOpen] = useState(false);
  const path = trim(usePathname());
  const { nav, footer } = useContent();

  // A new page opens at its top. Next's own scroll-on-navigate lands on the wrong element here
  // (every page shares one frame), so the links opt out of it and this resets the scroll.
  useEffect(() => {
    if (!location.hash) scrollTo({ top: 0, behavior: "instant" });
  }, [path]);
  const bar = useStickyHeader<HTMLElement>("#geoagents", true);

  // The open phone menu covers the screen; the page behind it stays put.
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    return () => document.documentElement.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header ref={bar}>
      <Link href="/" scroll={false} className="brand" aria-label="THEHEGEO trang chủ">
        <Logo className="brand-logo" />
      </Link>
      <nav id="site-navigation" aria-label="Điều hướng chính" className={open ? "open" : undefined}>
        {/* the links scroll on phones while the foot stays put (a plain row on desktop) */}
        <div className="nav-list">
        {nav.map((link) => {
          // A section is current on its own page and on any of its detail pages.
          const here = link.href === "/" ? path === "/" : path === trim(link.href) || path.startsWith(trim(link.href) + "/");
          const top = (
            <Link href={link.href} scroll={false} aria-current={here ? "page" : undefined} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          );
          if (!link.children) return <span key={link.href} className="nav-item">{top}</span>;
          return (
            <span key={link.href} className="nav-item has-menu">
              {top}
              <span className="nav-menu">
                {link.children.map((c) => (
                  <Link key={c.href} href={c.href} scroll={false} aria-current={trim(c.href) === path ? "page" : undefined} onClick={() => setOpen(false)}>
                    {c.label}
                  </Link>
                ))}
              </span>
            </span>
          );
        })}
        </div>
        {/* phones only: the address, at the foot of the open menu */}
        <span className="nav-foot">
          <a className="nav-mail" href={`mailto:${footer.email}`}>
            {footer.email}
          </a>
        </span>
      </nav>
      <div className="nav-actions">
        <LanguagePicker />
        <button
          id="menu"
          aria-expanded={open}
          aria-controls="site-navigation"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
