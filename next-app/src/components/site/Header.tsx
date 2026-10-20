"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useStickyHeader } from "./useStickyHeader";

const links = [
  { href: "#geoagents", label: "GEOagents" },
  { href: "#architecture", label: "Giải pháp" },
  { href: "#applications", label: "Ứng dụng" },
  { href: "#careers", label: "Tuyển dụng" },
  { href: "#about", label: "Về THEHEGEO" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const bar = useStickyHeader<HTMLElement>("#geoagents", true);

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
      <nav id="site-navigation" aria-label="Điều hướng chính" className={open ? "open" : undefined}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <span className="language">VI</span>
        <a className="contact-link" href="#applications">
          Khám phá <span>↗</span>
        </a>
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
