"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import Link from "next/link";
import { TDN, type CaseData } from "./cases";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
// Paper springing up off a fold: a little overshoot past upright, then settling.
const POP = "cubic-bezier(0.34, 1.45, 0.64, 1)";
const NARROW = "(max-width: 720px)";

/**
 * Size of the closed card (the second half of the open spread), from the same formulas as the CSS
 * (.tdn-book --W/--H). The paper on the case takes this shape, so the card that flies out of it is
 * the same paper at a larger size, not a different one.
 */
function closedCard(isJob = false) {
  const vertical = matchMedia(NARROW).matches;
  const vw = innerWidth;
  const vh = innerHeight;
  const W = vertical ? 0.92 * vw : Math.min(1000, 0.94 * vw);
  // A job folder on a phone is sized to its short brief, not to the screen.
  const H = isJob ? (vertical ? Math.min(720, 0.86 * vh) : Math.min(740, 0.9 * vh)) : vertical ? Math.min(740, 0.82 * vh) : Math.min(620, 0.84 * vh);
  return { vertical, W, H, w: vertical ? W : W / 2, h: vertical && !isJob ? H / 2 : H };
}

/** The paper card: on the case and on the card's cover. Sized in cqw, so both render identically. */
function Paper({ data }: { data: CaseData }) {
  return (
    <div className="paper">
      <span>{data.tag}</span>
      <b>
        {data.headline[0]}
        <br />
        {data.headline[1]}
      </b>
      <i className="paper-line" />
      <i className="paper-line is-short" />
      <div className="paper-stamp">
        {data.stamp[0]}
        <br />
        {data.stamp[1]}
      </div>
    </div>
  );
}

/**
 * A piece standing up off the open card, with the shadow it casts. Seen through perspective, a
 * standing layer is resampled from its own raster, so each piece is laid out at twice its size
 * (zoom) and scaled back by half in its transform (HI): its text keeps double the pixels.
 */
const HI = "scale(0.5)";
function Piece({ at, className, children, label }: { at: string; className: string; children: ReactNode; label?: boolean }) {
  return (
    <div className={`tdn-slot ${at}`}>
      <i className="tdn-cast" data-cast aria-hidden="true" />
      <div className="tdn-pop" data-pop aria-hidden={label ? undefined : true}>
        <div className={`tdn-pop-in ${className}`}>{children}</div>
      </div>
    </div>
  );
}

/** `bare`: the project card alone, for pages that give it their own heading (Use Case). */
export function Applications({ bare = false }: { bare?: boolean }) {
  return (
    <section className={bare ? "applications is-bare" : "applications wrap"} id={bare ? undefined : "applications"}>
      {!bare && (
        <div className="section-heading">
          <h2>
            Trí tuệ đi vào
            <br />
            <span>thực tiễn.</span>
          </h2>
          <p>
            GEOagents trong những bài toán
            <br />
            vận hành chuyên biệt.
          </p>
        </div>
      )}
      <ProjectCase data={TDN} />
    </section>
  );
}

/** One case study: a paper card on a panel that opens into the 3D spread. */
export function ProjectCase({ data, reading, applyHref, moreHref }: { data: CaseData; reading?: ReactNode; applyHref?: string; moreHref?: string }) {
  const titleId = `${useId().replace(/:/g, "")}-case-title`;
  const dialog = useRef<HTMLDialogElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const doc = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const popScale = reading ? "scale(1)" : HI;


  // showModal() focuses the dialog itself only when the dialog carries the autofocus attribute
  // (React's autoFocus prop does not write it); otherwise Safari jumps to the first button inside.
  useEffect(() => {
    dialog.current?.setAttribute("autofocus", "");
  }, []);

  // Keep the case paper in the closed card's proportions.
  useEffect(() => {
    const fit = () => {
      const c = closedCard(Boolean(reading));
      doc.current?.style.setProperty("--paper-ratio", `${c.w} / ${c.h}`);
      // the same ratio as a number, so the paper can be fitted to its frame both ways (cta.css)
      doc.current?.style.setProperty("--paper-r", (c.w / c.h).toFixed(4));
    };
    fit();
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, []);

  /**
   * The case's paper lifts off the case, turns level and flies to the centre (a FLIP from its place
   * on the page), then lies down flat like a card on a desk and opens: the cover swings 180° on its
   * spine and every piece of information stands up off the open card, hinged at its base, in three
   * rows, seen at eye level like a paper stage (taller rows stand further back). Each piece stands
   * square to the viewer, so its text reads undistorted, and casts a soft shadow back across the card.
   */
  const geometry = () => {
    const el = book.current!;
    const c = closedCard(Boolean(reading));
    // The closed card is the second half of the spread; shift the spread so it sits centred.
    const shift = reading && c.vertical ? "0px, 0px" : c.vertical ? `0px, ${-c.H / 4}px` : `${-c.W / 4}px, 0px`;
    const paper = doc.current!;
    const r = paper.getBoundingClientRect();
    const scale = paper.offsetWidth / c.w;
    const m = new DOMMatrix(getComputedStyle(paper).transform);
    const angle = (Math.atan2(m.b, m.a) * 180) / Math.PI;
    const dx = r.left + r.width / 2 - innerWidth / 2;
    const dy = r.top + r.height / 2 - innerHeight / 2;
    const start = `translate(${dx}px, ${dy}px) translate(${shift}) rotate(${angle}deg) scale(${scale})`;
    const closed = `translate(${shift}) translateZ(0px)`;
    const lifted = `translate(${dx * 0.35}px, ${dy * 0.35}px) translate(${shift}) rotate(${angle / 2}deg) translateZ(90px) scale(${(scale + 1) / 2})`;
    // Eye level with the table: the card lies almost flat and the pieces stand by the same angle.
    const tilt = reading ? 0 : (c.vertical ? 64 : 66);
    const spread = reading ? "none" : `translateY(${c.H * (c.vertical ? 0.12 : 0.24)}px) rotateX(${tilt}deg)`;
    el.style.setProperty("--tilt", `${tilt}deg`);
    return { start, closed, lifted, spread, rise: `rotateX(${-tilt}deg) ${popScale}`, cover: c.vertical && !reading ? "rotateX(180deg)" : "rotateY(-180deg)" };
  };

  const parts = () => {
    const el = book.current!;
    return {
      el,
      cover: el.querySelector<HTMLElement>(".tdn-cover")!,
      faces: [...el.querySelectorAll<HTMLElement>(".tdn-front, .tdn-inside")],
      pops: [...el.querySelectorAll<HTMLElement>("[data-pop]")],
      casts: [...el.querySelectorAll<HTMLElement>("[data-cast]")],
    };
  };

  const open = async () => {
    const d = dialog.current;
    if (!d || busy.current || d.open) return;
    busy.current = true;
    d.showModal();
    d.focus({ preventScroll: true });
    d.scrollTop = 0;
    const { el, cover, faces, pops, casts } = parts();
    const g = geometry();
    d.classList.add("is-open");
    if (reading) {
      const content = el.querySelector<HTMLElement>(".job-folder-content")!;
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        doc.current!.style.visibility = "hidden";
        // The text is printed on the open leaves: it stays hidden while the closed folder flies in
        // and while the cover swings, and shows only once the cover lies open (the cover's inside
        // and the right leaf share the reading pages' colours, so the text simply appears on them).
        content.style.opacity = "0";
        await el.animate([{ transform: g.start }, { transform: g.closed }], { duration: 420, easing: EASE, fill: "forwards" }).finished;
        await Promise.all([
          el.animate([{ transform: g.closed }, { transform: "none" }], { duration: 640, easing: EASE, fill: "forwards" }).finished,
          cover.animate([{ transform: "none" }, { transform: g.cover }], { duration: 640, easing: EASE, fill: "forwards" }).finished,
        ]);
        await content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out", fill: "forwards" }).finished;
      }
      content.style.removeProperty("opacity");
      // Once unfolded, render type at native size with no 3D/composited ancestor.
      d.classList.add("is-standing", "is-job-ready");
      [el, cover, content].forEach(n => n.getAnimations().forEach(a => a.cancel()));
      // The book is centred with half-viewport offsets, which can land the text between device
      // pixels and soften it; nudge it onto the pixel grid.
      el.style.transform = "none";
      const r = el.getBoundingClientRect();
      const px = (v: number) => (Math.round(v * devicePixelRatio) / devicePixelRatio - v).toFixed(3);
      el.style.transform = `translate(${px(r.left)}px, ${px(r.top)}px)`;
      busy.current = false;
      return;
    }

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.transform = g.spread;
      cover.style.transform = g.cover;
      pops.forEach((n) => Object.assign(n.style, { transform: g.rise, opacity: "1" }));
      casts.forEach((n) => (n.style.opacity = "1"));
      d.classList.add("is-standing");
      busy.current = false;

      return;
    }
    // The case paper hands over to the card in the first moments of the flight. Only flat leaves
    // fade (opacity on the 3D card itself would flatten everything inside it).
    doc.current!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: "forwards" });
    faces.forEach((f) => f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100 }));
    await el.animate([{ transform: g.start }, { transform: g.lifted, offset: 0.45 }, { transform: g.closed }], { duration: 440, easing: EASE, fill: "forwards" }).finished;
    // Lie down, opening the cover on the way down; then the pieces stand up, back row first, each
    // springing a touch past upright while its shadow stretches out behind it.
    el.animate([{ transform: g.closed }, { transform: g.spread }], { duration: 480, easing: EASE, fill: "forwards" });
    cover.animate([{ transform: "none" }, { transform: g.cover }], { duration: 520, delay: 180, easing: EASE, fill: "forwards" });
    setTimeout(() => d.classList.add("is-standing"), 560);
    pops.forEach((n, i) => {
      const delay = 480 + i * 55;
      n.animate([{ opacity: 0, transform: `rotateX(0deg) ${popScale}` }, { opacity: 1, transform: `rotateX(-6deg) ${popScale}`, offset: 0.1 }, { opacity: 1, transform: g.rise }], { duration: 520, delay, easing: POP, fill: "forwards" });
      casts[i].animate([{ opacity: 0, transform: "skewX(var(--sun-skew)) scaleY(0.05)" }, { opacity: 1, transform: "skewX(var(--sun-skew)) scaleY(1)" }], { duration: 520, delay, easing: EASE, fill: "forwards" });
    });
    await Promise.all([el, cover, ...pops, ...casts].flatMap((n) => n.getAnimations().map((a) => a.finished.catch(() => {}))));
    // Hand the final poses to plain styles, so the browser re-rasterises everything at full size
    // (a held animation can keep the layers at the small scale they started from). The poses are
    // written out rather than read back with commitStyles(): Safari can commit a piece's starting
    // keyframe instead of its end, which left the middle sheet invisible and flat on iPhone.
    const ended = (n: Element) => n.getAnimations().forEach((a) => a.cancel());
    [el, cover, ...pops, ...casts].forEach(ended);
    el.style.transform = g.spread;
    cover.style.transform = g.cover;
    pops.forEach((n) => Object.assign(n.style, { transform: g.rise, opacity: "1" }));
    casts.forEach((n) => Object.assign(n.style, { transform: "skewX(var(--sun-skew)) scaleY(1)", opacity: "1" }));
    busy.current = false;

  };

  /** Shut the open folder at once, with no closing motion (when leaving the page from inside it). */
  const dismiss = () => {
    const d = dialog.current;
    const el = book.current;
    if (!d || !el) return;
    [el, ...el.querySelectorAll("*")].forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
    el.style.removeProperty("transform");
    d.classList.remove("is-open", "is-standing", "is-job-ready");
    if (d.open) d.close();
    doc.current!.style.visibility = "";
    busy.current = false;
  };

  const close = async (after?: () => void) => {
    const d = dialog.current;
    if (!d || busy.current || !d.open) return;
    busy.current = true;
    const { el, cover, faces, pops, casts } = parts();
    if (reading) {
      const g = geometry();
      d.classList.remove("is-job-ready", "is-standing");
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const content = el.querySelector<HTMLElement>(".job-folder-content")!;
        // The text lifts off the leaves first, then the cover closes over blank pages.
        cover.style.transform = g.cover;
        el.style.transform = "none";
        await content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }).finished;
        cover.style.removeProperty("transform");
        await Promise.all([
          cover.animate([{ transform: g.cover }, { transform: "none" }], { duration: 420, easing: EASE, fill: "forwards" }).finished,
          el.animate([{ transform: "none" }, { transform: g.closed }], { duration: 420, easing: EASE, fill: "forwards" }).finished,
        ]);
        await el.animate([{ transform: g.closed }, { transform: g.start }], { duration: 350, easing: EASE, fill: "forwards" }).finished;
      }
      d.close();
      d.classList.remove("is-open");
      el.querySelectorAll("*").forEach(n => n.getAnimations().forEach(a => a.cancel()));
      el.getAnimations().forEach(a => a.cancel());
      el.style.removeProperty("transform");
      doc.current!.style.visibility = "";
      busy.current = false;
      after?.();
      return;
    }
    d.classList.remove("is-standing");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const g = geometry();
      // Pieces fold flat (front row first), their shadows shrinking back under them.
      await Promise.all(
        pops
          .map((n, i) => [n, casts[i]] as const)
          .reverse()
          .flatMap(([n, cast], i) => {
            const t = { duration: 260, delay: i * 35, easing: "cubic-bezier(0.55, 0, 0.75, 0.3)", fill: "forwards" as const };
            return [
              n.animate([{ transform: g.rise, opacity: 1 }, { transform: `rotateX(0deg) ${popScale}`, opacity: 1, offset: 0.85 }, { transform: `rotateX(0deg) ${popScale}`, opacity: 0 }], t).finished,
              cast.animate([{ opacity: 1, transform: "skewX(var(--sun-skew)) scaleY(1)" }, { opacity: 0, transform: "skewX(var(--sun-skew)) scaleY(0.05)" }], t).finished,
            ];
          }),
      );
      cover.animate([{ transform: g.cover }, { transform: "none" }], { duration: 400, easing: EASE, fill: "forwards" });
      await el.animate([{ transform: g.spread }, { transform: g.closed }], { duration: 420, easing: EASE, fill: "forwards" }).finished;
      d.classList.remove("is-open");
      // Fly back and hand over to the case paper, which is the same shape and size on landing.
      doc.current!.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: 420, fill: "forwards" });
      faces.forEach((f) => f.animate([{ opacity: 1 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], { duration: 420, fill: "forwards" }));
      await el.animate([{ transform: g.closed }, { transform: g.lifted, offset: 0.55 }, { transform: g.start }], { duration: 420, easing: EASE, fill: "forwards" }).finished;
    }
    d.classList.remove("is-open");
    d.close();
    for (const n of [el, cover, doc.current!, ...faces, ...pops, ...casts]) {
      n.getAnimations().forEach((a) => a.cancel());
      n.style.removeProperty("transform");
      n.style.removeProperty("opacity");
    }
    busy.current = false;
    after?.();
  };

  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    close();
  };
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialog.current) close();
  };
  // Demo bookings go to the contact page (its form).
  const router = useRouter();
  const toDemo = () => close(() => router.push("/ve-thehegeo/lien-he/", { scroll: false }));

  return (
    <>
        <div className="projects is-single">
          <button className={`project tone-${data.tone}${data.mock ? " is-mock" : ""}`} onClick={open} aria-haspopup="dialog">
            <div className="project-visual">
              <div className="document" ref={doc}>
                <Paper data={data} />
              </div>
              {data.index && <span className="visual-index">{data.index}</span>}
            </div>
            <div className="project-info">
              <div>
                <h3>{data.name}</h3>
                <p>{data.org}</p>
              </div>
              <span className="project-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <p className="project-desc">{data.summary}</p>
          </button>
        </div>

      <dialog ref={dialog} className={`tdn-dialog tone-${data.tone}${reading ? " has-job" : ""}`} tabIndex={-1} autoFocus aria-label={reading ? data.name : undefined} aria-labelledby={reading ? undefined : titleId} onCancel={onCancel} onClick={onBackdrop}>
        <div className="tdn-book" ref={book}>
          <div className="tdn-ground" aria-hidden="true" />
          <div className="tdn-page tdn-inside" />
          {/* the cover: the paper outside, plain card stock inside */}
          <div className="tdn-cover">
            <div className="tdn-face tdn-front">
              <Paper data={data} />
            </div>
            <div className="tdn-face tdn-back" />
          </div>
          {/* Everything else stands up off the open card, in three rows; DOM order is back to front
              (also the order the pieces rise in). */}
          <div className="tdn-edge" aria-hidden="true" />
          {reading ? <article className="job-folder-content" data-lenis-prevent>
            <div className="job-folder-intro">
              <h2>{data.name}</h2>
              <p className="job-folder-team">{data.org}</p>
              <p className="job-folder-summary">{data.description}</p>
              <span className="job-folder-mark" aria-hidden="true">THEHEGEO</span>
            </div>
            <button type="button" className="job-folder-close" onClick={() => close()} aria-label="Đóng mô tả công việc">Đóng</button>
            <div className="folder-reading-body">{reading}</div>
            <div className="folder-reading-footer">
              <a className="button" href={applyHref}>Ứng tuyển vị trí này</a>
              {/* Next keeps the list page alive behind the next one, so the modal must shut on the way out. */}
              {moreHref && <Link className="folder-reading-more" href={moreHref} scroll={false} onClick={dismiss}>Xem JD đầy đủ</Link>}
            </div>
          </article> : <div className="tdn-pops">
            {data.checks.map((c, i) => (
              <Piece key={c} at={`at-sheet-${i}`} className="tdn-sheet">
                <b>{c}</b>
                <span className="tdn-sheet-line" />
                <span className="tdn-sheet-line" />
                <span className="tdn-sheet-line is-short" />
                <small>{data.checkFoot}</small>
              </Piece>
            ))}
            <Piece at="at-title" className="tdn-panel tdn-title" label>
              <p className="tdn-index">
                {data.kicker}
              </p>
              <h2 id={titleId}>{data.name}</h2>
              <p className="tdn-org">{data.org}</p>
            </Piece>
            <Piece at="at-about" className="tdn-panel tdn-about" label>
              <p className="tdn-lead">{data.description}</p>
              {/* phones have no room for the separate note piece: it closes the description instead */}
              <p className="tdn-about-note">{data.note}</p>
              <p className="tdn-checks-sr">{data.checkFoot}: {data.checks.join(", ")}.</p>
            </Piece>
            <Piece at="at-seal" className="tdn-seal">
              {data.stamp[0]}
              <br />
              {data.stamp[1]}
            </Piece>
            <Piece at="at-note" className="tdn-panel tdn-note" label>
              {data.note}
            </Piece>
            <Piece at="at-actions" className="tdn-panel tdn-actions" label>
              {applyHref ? <a className="tdn-primary" href={applyHref}>Ứng tuyển</a> : <button type="button" className="tdn-primary" onClick={toDemo}>Đặt lịch demo</button>}
              <button type="button" className="tdn-close" onClick={() => close()}>
                Đóng
              </button>
            </Piece>
          </div>}
        </div>
      </dialog>
    </>
  );
}



