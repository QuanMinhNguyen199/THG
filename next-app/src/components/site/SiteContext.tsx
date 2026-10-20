"use client";

import { animate } from "animejs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { themes, type Theme } from "./content";

type SiteState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** True when prefers-reduced-motion stops decorative motion. */
  paused: boolean;
  /** Live values for rAF loops and anime callbacks, which must not wait for a re-render. */
  pausedRef: RefObject<boolean>;
  accentRef: RefObject<string>;
  inkRef: RefObject<string>;
  announcement: string;
};

const SiteContext = createContext<SiteState | null>(null);

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite must be used inside <SiteProvider>");
  return value;
}

const isTheme = (value: string | undefined): value is Theme => themes.some((t) => t.id === value);

/** The theme follows the system colour scheme: dark shows Dark Tech, light shows Industrial. */
const systemVariant = (): Theme => (matchMedia("(prefers-color-scheme: light)").matches ? "industrial" : "tech");

/**
 * Canvas code appends a two-digit alpha to the accent ("#c1152b" + "40"), so it needs #rrggbb.
 * The production CSS minifier shortens colours (#ffffff becomes #fff), so expand them here.
 */
const toHex6 = (value: string) => {
  const v = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${[...v.slice(1)].map((c) => c + c).join("")}`;
  return null;
};

export function SiteProvider({ children }: { children: ReactNode }) {
  // The inline script in the layout sets <html data-theme> before paint; state catches up on mount.
  const [theme, setThemeState] = useState<Theme>("tech");
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const pausedRef = useRef(false);
  const accentRef = useRef("#c1152b");
  const inkRef = useRef("#ffffff");
  const announced = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPaused(reduce.matches);
    const onChange = (e: MediaQueryListEvent) => setPaused(e.matches);
    reduce.addEventListener("change", onChange);
    return () => reduce.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    document.body.classList.toggle("motion-paused", paused);
  }, [paused]);

  // Apply the theme to the document and mirror its CSS colours into the canvas refs.
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    const styles = getComputedStyle(root);
    // Canvas linework can differ from the CSS accent.
    accentRef.current =
      toHex6(styles.getPropertyValue("--canvas-accent")) ?? toHex6(styles.getPropertyValue("--red")) ?? accentRef.current;
    inkRef.current = styles.getPropertyValue("--floor-ink").trim() || inkRef.current;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", styles.getPropertyValue("--bg").trim());
    // The theme is never stored or put in the URL: it always follows the system.
    const url = new URL(location.href);
    if (url.searchParams.has("theme")) {
      url.searchParams.delete("theme");
      history.replaceState(null, "", url);
    }
  }, []);

  useEffect(() => {
    // The inline script already chose a saved or shared concept; adopt it before applying anything,
    // so the default "tech" never overwrites it.
    if (!announced.current) {
      const initial = document.documentElement.dataset.theme;
      if (isTheme(initial) && initial !== theme) {
        setThemeState(initial);
        return;
      }
    }
    applyTheme(theme);
    // Announce user-initiated changes only, not the initial adoption.
    if (announced.current) setAnnouncement(`Giao diện ${themes.find((t) => t.id === theme)?.name}`);
    announced.current = true;
  }, [theme, applyTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (!pausedRef.current) {
      animate(".hero-copy", { opacity: [0.65, 1], y: [10, 0], duration: 450, ease: "outExpo" });
    }
  }, []);


  // Follow system scheme changes live.
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setThemeState(systemVariant());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, paused, pausedRef, accentRef, inkRef, announcement }),
    [theme, setTheme, paused, announcement],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
