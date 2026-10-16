"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useSite } from "./SiteContext";
import { useStickyHeader } from "./useStickyHeader";

const links = [
  { href: "#geoagents", label: "GEOagents" },
  { href: "#architecture", label: "Giải pháp" },
  { href: "#applications", label: "Ứng dụng" },
  { href: "#about", label: "Về THEHEGEO" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useSite();
  const bar = useStickyHeader<HTMLElement>("#geoagents", theme === "tech" || theme === "industrial");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header ref={bar}>
      <a href="#" className="brand" aria-label="THEHEGEO trang chủ">
        <Logo className="brand-logo" />
      </a>
      <nav aria-label="Điều hướng chính" className={open ? "open" : undefined}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <label className="nav-theme">
          <span>Theme</span>
          <select aria-label="Theme" value={theme === "industrial" ? "industrial" : "tech"}
            onChange={(event) => setTheme(event.target.value === "industrial" ? "industrial" : "tech")}>
            <option value="tech">Dark Tech</option>
            <option value="industrial">Industrial</option>
          </select>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
        </label>
        <span className="language">VI</span>
        <a className="contact-link" href="#applications">
          Khám phá <span>↗</span>
        </a>
        <button
          id="menu"
          aria-expanded={open}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
