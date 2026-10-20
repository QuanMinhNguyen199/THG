"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import { projects } from "./content";

const tax = projects.tax;
// What the product checks, taken from its description (no claims beyond the existing copy).
const CHECKS = ["Báo cáo tài chính", "Thuế giá trị gia tăng", "Thuế thu nhập doanh nghiệp"];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
// Paper springing up off a fold: a little overshoot past upright, then settling.
const POP = "cubic-bezier(0.34, 1.45, 0.64, 1)";
const NARROW = "(max-width: 720px)";

/**
 * Size of the closed card (the second half of the open spread), from the same formulas as the CSS
 * (.tdn-book --W/--H). The paper on the case takes this shape, so the card that flies out of it is
 * the same paper at a larger size, not a different one.
 */
function closedCard() {
  const vertical = matchMedia(NARROW).matches;
  const vw = innerWidth;
  const vh = innerHeight;
  const W = vertical ? 0.92 * vw : Math.min(1000, 0.94 * vw);
  const H = vertical ? Math.min(740, 0.82 * vh) : Math.min(620, 0.84 * vh);
  return { vertical, W, H, w: vertical ? W : W / 2, h: vertical ? H / 2 : H };
}

/** The paper card: on the case and on the card's cover. Sized in cqw, so both render identically. */
function Paper() {
  return (
    <div className="paper">
      <span>AI / TAX INTELLIGENCE</span>
      <b>
        Đúng dữ liệu.
        <br />
        Rõ nghĩa vụ.
      </b>
      <i className="paper-line" />
      <i className="paper-line is-short" />
      <div className="paper-stamp">
        TAX
        <br />
        360
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

export function Applications() {
  const dialog = useRef<HTMLDialogElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const doc = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  // showModal() focuses the dialog itself only when the dialog carries the autofocus attribute
  // (React's autoFocus prop does not write it); otherwise Safari jumps to the first button inside.
  useEffect(() => {
    dialog.current?.setAttribute("autofocus", "");
  }, []);

  // Keep the case paper in the closed card's proportions.
  useEffect(() => {
    const fit = () => {
      const c = closedCard();
      doc.current?.style.setProperty("--paper-ratio", `${c.w} / ${c.h}`);
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
    const c = closedCard();
    // The closed card is the second half of the spread; shift the spread so it sits centred.
    const shift = c.vertical ? `0px, ${-c.H / 4}px` : `${-c.W / 4}px, 0px`;
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
    const tilt = c.vertical ? 64 : 66;
    const spread = `translateY(${c.H * (c.vertical ? 0.12 : 0.24)}px) rotateX(${tilt}deg)`;
    el.style.setProperty("--tilt", `${tilt}deg`);
    return { start, closed, lifted, spread, rise: `rotateX(${-tilt}deg) ${HI}`, cover: c.vertical ? "rotateX(180deg)" : "rotateY(-180deg)" };
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
      n.animate([{ opacity: 0, transform: `rotateX(0deg) ${HI}` }, { opacity: 1, transform: `rotateX(-6deg) ${HI}`, offset: 0.1 }, { opacity: 1, transform: g.rise }], { duration: 520, delay, easing: POP, fill: "forwards" });
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

  const close = async (after?: () => void) => {
    const d = dialog.current;
    if (!d || busy.current || !d.open) return;
    busy.current = true;
    const { el, cover, faces, pops, casts } = parts();
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
              n.animate([{ transform: g.rise, opacity: 1 }, { transform: `rotateX(0deg) ${HI}`, opacity: 1, offset: 0.85 }, { transform: `rotateX(0deg) ${HI}`, opacity: 0 }], t).finished,
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
  const toDemo = () => close(() => document.querySelector("#cta")?.scrollIntoView({ behavior: "smooth" }));

  return (
    <>
      <section className="applications wrap" id="applications">
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
        <div className="projects is-single">
          <button className="project tax" onClick={open} aria-haspopup="dialog">
            <div className="project-visual">
              <div className="document" ref={doc}>
                <Paper />
              </div>
              <span className="visual-index">{tax.index}</span>
            </div>
            <div className="project-info">
              <div>
                <h3>{tax.name}</h3>
                <p>{tax.company}</p>
              </div>
              <span className="project-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <p className="project-desc">{tax.summary}</p>
          </button>
        </div>
      </section>

      <dialog ref={dialog} className="tdn-dialog" tabIndex={-1} autoFocus aria-labelledby="tdn-title" onCancel={onCancel} onClick={onBackdrop}>
        <div className="tdn-book" ref={book}>
          <div className="tdn-ground" aria-hidden="true" />
          <div className="tdn-page tdn-inside" />
          {/* the cover: the paper outside, plain card stock inside */}
          <div className="tdn-cover">
            <div className="tdn-face tdn-front">
              <Paper />
            </div>
            <div className="tdn-face tdn-back" />
          </div>
          {/* Everything else stands up off the open card, in three rows; DOM order is back to front
              (also the order the pieces rise in). */}
          <div className="tdn-edge" aria-hidden="true" />
          <div className="tdn-pops">
            {CHECKS.map((c, i) => (
              <Piece key={c} at={`at-sheet-${i}`} className="tdn-sheet">
                <b>{c}</b>
                <span className="tdn-sheet-line" />
                <span className="tdn-sheet-line" />
                <span className="tdn-sheet-line is-short" />
                <small>Theo mã số thuế</small>
              </Piece>
            ))}
            <Piece at="at-title" className="tdn-panel tdn-title" label>
              <p className="tdn-index">Tài chính và thuế</p>
              <h2 id="tdn-title">{tax.name}</h2>
              <p className="tdn-org">{tax.company}</p>
            </Piece>
            <Piece at="at-about" className="tdn-panel tdn-about" label>
              <p className="tdn-lead">{tax.description}</p>
              {/* phones have no room for the separate note piece: it closes the description instead */}
              <p className="tdn-about-note">AI đối chiếu và chỉ ra chênh lệch. Cán bộ thuế xem xét và kết luận.</p>
              <p className="tdn-checks-sr">Đối chiếu theo mã số thuế: {CHECKS.join(", ")}.</p>
            </Piece>
            <Piece at="at-seal" className="tdn-seal">
              TAX
              <br />
              360
            </Piece>
            <Piece at="at-note" className="tdn-panel tdn-note" label>
              AI đối chiếu và chỉ ra chênh lệch. Cán bộ thuế xem xét và kết luận.
            </Piece>
            <Piece at="at-actions" className="tdn-panel tdn-actions" label>
              <button type="button" className="tdn-primary" onClick={toDemo}>
                Đặt lịch demo
              </button>
              <button type="button" className="tdn-close" onClick={() => close()}>
                Đóng
              </button>
            </Piece>
          </div>
        </div>
      </dialog>
    </>
  );
}

