"use client";

// Case cards that are not paper folders (cases.ts `model`): each is drawn as its own object and
// opens its own way. The card's small model grows into a large one (a FLIP from its place on the
// page), then the large model plays its reveal while the information panel slides in:
//   call  — a phone; the call's exchange appears line by line on its screen.
//   board — a clipboard; its columns swing open one after another and the cards drop in.
//   stack — a server stack; its modules separate and each module's label slides out.
// Reduced motion skips the movement and shows the open state at once.
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, type MouseEvent, type SyntheticEvent } from "react";
import type { CaseData } from "./cases";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const THUMB_GAP = 14; // stack: px between modules on the card
const FULL_GAP = 62; // stack: px between modules once open

function Phone({ data, full }: { data: CaseData; full: boolean }) {
  return (
    <div className={`m-phone${full ? " is-full" : ""}`}>
      <div className="m-phone-screen">
        <span className="m-phone-app">{data.name}</span>
        <strong className="m-phone-caller">{data.org.split("·").pop()?.trim()}</strong>
        {full ? (
          <ol className="m-phone-feed">
            {data.script?.map((l, i) => (
              <li key={i} className={`is-${l.who}`} data-reveal>
                {l.text}
              </li>
            ))}
          </ol>
        ) : (
          <span className="m-phone-time">Đang kết nối…</span>
        )}
        <span className="m-wave" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 5) * 0.12}s` }} />
          ))}
        </span>
        <span className="m-phone-end" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M3 14.5c5-4.6 13-4.6 18 0l-2.4 2.6c-.4.4-1 .4-1.4.1l-2-1.4a1 1 0 0 1-.4-.9l.2-1.6a12 12 0 0 0-6 0l.2 1.6c0 .4-.1.7-.4.9l-2 1.4c-.4.3-1 .3-1.4-.1Z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function Board({ data, full }: { data: CaseData; full: boolean }) {
  return (
    <div className={`m-board${full ? " is-full" : ""}`}>
      <span className="m-board-clip" aria-hidden="true" />
      <div className="m-board-sheet">
        {data.board?.map((c) => (
          <div key={c.col} className="m-col" data-col>
            <span className="m-col-head">{full ? c.col : ""}</span>
            {c.cards.map((t) => (
              <span key={t} className="m-card" data-card>
                {full ? t : ""}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stack({ data, full }: { data: CaseData; full: boolean }) {
  const gap = full ? FULL_GAP : THUMB_GAP;
  return (
    <div className={`m-stack${full ? " is-full" : ""}`}>
      <div className="m-stack-world">
        {[2, 1, 0].map((i) => (
          <div key={i} className="m-layer" data-layer={i} style={{ transform: `translateZ(${i * gap}px)` }}>
            <span className="m-leds">
              <i />
              <i />
              <i />
            </span>
            <span className="m-vents" />
          </div>
        ))}
      </div>
      {full && (
        <ol className="m-stack-labels">
          {[...data.checks].reverse().map((c) => (
            <li key={c} data-reveal>
              {c}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Model({ data, full }: { data: CaseData; full: boolean }) {
  if (data.model === "call") return <Phone data={data} full={full} />;
  if (data.model === "board") return <Board data={data} full={full} />;
  return <Stack data={data} full={full} />;
}

/** The opening reveal of the large model, per kind. */
function reveal(kind: CaseData["model"], model: HTMLElement) {
  const all = (sel: string) => [...model.querySelectorAll<HTMLElement>(sel)];
  const fade = (from: string): Keyframe[] => [{ opacity: 0, transform: from }, { opacity: 1, transform: "none" }];
  if (kind === "call")
    all("[data-reveal]").forEach((el, i) =>
      el.animate(fade("translateY(14px)"), { duration: 380, delay: 520 + i * 420, easing: EASE, fill: "backwards" }),
    );
  if (kind === "board") {
    all("[data-col]").forEach((el, i) =>
      el.animate(fade("perspective(700px) rotateY(-82deg)"), { duration: 520, delay: 420 + i * 140, easing: EASE, fill: "backwards" }),
    );
    all("[data-card]").forEach((el, i) =>
      el.animate(fade("translateY(-22px)"), { duration: 360, delay: 900 + i * 70, easing: "cubic-bezier(0.34, 1.45, 0.64, 1)", fill: "backwards" }),
    );
  }
  if (kind === "stack") {
    all("[data-layer]").forEach((el) => {
      const i = Number(el.dataset.layer);
      el.animate([{ transform: `translateZ(${i * THUMB_GAP}px)` }, { transform: `translateZ(${i * FULL_GAP}px)` }], {
        duration: 700,
        delay: 380,
        easing: EASE,
        fill: "backwards",
      });
    });
    all("[data-reveal]").forEach((el, i) =>
      el.animate(fade("translateX(-18px)"), { duration: 380, delay: 760 + i * 130, easing: EASE, fill: "backwards" }),
    );
  }
}

export function CaseShowcase({ data }: { data: CaseData }) {
  const titleId = `${useId().replace(/:/g, "")}-case-title`;
  const dialog = useRef<HTMLDialogElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  // showModal() focuses the dialog itself only with a real autofocus attribute (see Applications).
  useEffect(() => {
    dialog.current?.setAttribute("autofocus", "");
  }, []);

  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** The transform that puts the large model over the card's small one. */
  const flip = (full: HTMLElement) => {
    const a = thumb.current!.getBoundingClientRect();
    const b = full.getBoundingClientRect();
    const s = Math.min(a.width / b.width, a.height / b.height);
    return `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${s})`;
  };

  const open = () => {
    const d = dialog.current;
    if (!d || busy.current || d.open) return;
    d.showModal();
    d.focus({ preventScroll: true });
    d.scrollTop = 0;
    if (reduced()) return;
    busy.current = true;
    const full = d.querySelector<HTMLElement>(".cm-model > *")!;
    const info = [...d.querySelectorAll<HTMLElement>("[data-info]")];
    d.querySelector(".cm-backdrop")?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
    thumb.current!.style.visibility = "hidden";
    const grow = full.animate([{ transform: flip(full) }, { transform: "none" }], { duration: 560, easing: EASE });
    reveal(data.model, full);
    info.forEach((el, i) =>
      el.animate([{ opacity: 0, transform: "translateX(28px)" }, { opacity: 1, transform: "none" }], {
        duration: 420,
        delay: 300 + i * 70,
        easing: EASE,
        fill: "backwards",
      }),
    );
    grow.finished.finally(() => (busy.current = false));
  };

  const close = async (after?: () => void) => {
    const d = dialog.current;
    if (!d || busy.current || !d.open) return;
    if (!reduced()) {
      busy.current = true;
      const full = d.querySelector<HTMLElement>(".cm-model > *")!;
      d.querySelectorAll<HTMLElement>("[data-info]").forEach((el) =>
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }),
      );
      d.querySelector(".cm-backdrop")?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: "forwards" });
      await full.animate([{ transform: "none" }, { transform: flip(full) }], { duration: 420, easing: EASE, fill: "forwards" }).finished.catch(() => {});
    }
    d.close();
    d.querySelectorAll("*").forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    if (thumb.current) thumb.current.style.visibility = "";
    busy.current = false;
    after?.();
  };

  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    close();
  };
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    const t = e.target as Element;
    if (t === dialog.current || t.classList.contains("cm-backdrop") || t.classList.contains("cm-stage")) close();
  };
  // Demo bookings go to the contact page (its form).
  const router = useRouter();
  const toDemo = () => close(() => router.push("/ve-thehegeo/lien-he/", { scroll: false }));

  return (
    <>
      <div className="projects is-single">
        <button className={`project tone-${data.tone} model-${data.model}${data.mock ? " is-mock" : ""}`} onClick={open} aria-haspopup="dialog">
          <div className="project-visual">
            <div className="cm-thumb" ref={thumb} aria-hidden="true">
              <Model data={data} full={false} />
            </div>
            <span className="visual-index">{data.index}</span>
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

      <dialog ref={dialog} className={`cm-dialog tone-${data.tone} model-${data.model}`} tabIndex={-1} aria-labelledby={titleId} onCancel={onCancel} onClick={onBackdrop}>
        <div className="cm-backdrop" aria-hidden="true" />
        <div className="cm-stage">
          <div className="cm-model" aria-hidden="true">
            <Model data={data} full />
          </div>
          <div className="cm-info">
            <p className="cm-kicker" data-info>
              {data.kicker}
            </p>
            <h2 id={titleId} data-info>
              {data.name}
            </h2>
            <p className="cm-org" data-info>
              {data.org}
            </p>
            <p className="cm-lead" data-info>
              {data.description}
            </p>
            <ul className="cm-checks" data-info>
              {data.checks.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="cm-note" data-info>
              {data.note}
            </p>
            <div className="cm-actions" data-info>
              <button type="button" className="tdn-primary" onClick={toDemo}>
                Đặt lịch demo
              </button>
              <button type="button" className="tdn-close" onClick={() => close()}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
