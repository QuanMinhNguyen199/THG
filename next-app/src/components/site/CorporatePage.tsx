"use client";

// Concept 2 (Corporate): its own page, following the supplied design — monospace type, white
// canvas, red plexus networks, slanted comparison cards and a demo request form.
// The shared page is hidden while this concept is active (and vice versa) by CSS on data-theme.

import { animate, splitText, stagger, utils } from "animejs";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CONTACT_EMAIL, ContactList } from "./Contacts";
import { Logo } from "./Logo";
import { HeroDemo, Sovereignty, StepFlow, useCaseTilt } from "./CorporateShowcase";
import { Plexus } from "./Plexus";
import { asset } from "@/lib/asset";
import { useSite } from "./SiteContext";
import { AgentWorkflow } from "./AgentWorkflow";

const NAV = [
  { href: "#ca-hero", label: "GeoAgent" },
  { href: "#ca-what", label: "Ứng dụng" },
  { href: "#ca-cases", label: "Dự án" },
  { href: "#ca-team", label: "TheheGEO" },
  // TODO(unconfirmed): no careers page exists yet; this points at the contact form for now.
  { href: "#ca-demo", label: "Tuyển dụng" },
];


// Copy transcribed from the design. Card 3's "Thường thấy" line repeats card 2's in the design;
// kept as supplied until the intended wording is confirmed.
const DIFF = [
  { usual: "Chờ người dùng hỏi; trả lời xong là hết việc", geo: "Nhận việc, không chỉ trả lời", filled: true },
  { usual: "Trợ lý riêng cho từng người dùng", geo: "Cho cả bộ máy, không chỉ cho một người", filled: false },
  { usual: "Trợ lý riêng cho từng người dùng", geo: "Con người quyết định, có dấu vết", filled: true },
  { usual: "Chạy trên đám mây của nhà cung cấp; dữ liệu và mô hình gắn với một hãng", geo: "Không bị khóa, kể cả với chúng tôi", filled: false },
];

// Images are frames from the company's own hero film until real project photos are supplied.
const CASES = [
  { img: asset("/media/case-tax.jpg"), org: "Thuế TP Hà Nội", body: "Phân tích sức khỏe tài chính và rủi ro thuế doanh nghiệp" },
  { img: asset("/media/case-city.jpg"), org: "TP Hà Nội", body: "Một nền tảng AI cho nhiều cơ quan: HKD, A360DN,.." },
  { img: asset("/media/case-ptsc.jpg"), org: "PTSC M&C", body: "Trợ lý AI cho hồ sơ kỹ thuật dự án công nghiệp" },
];


/** Line icons for the three steps; each path draws itself in when the steps scroll into view. */
const STEP_ICONS = [
  <svg key="read" viewBox="0 0 48 48">
    <path pathLength={1} d="M12 6h18l8 8v28H12zM30 6v8h8" />
    <path pathLength={1} d="M18 34v-6m6 6V24m6 10v-8" />
  </svg>,
  <svg key="propose" viewBox="0 0 48 48">
    <path pathLength={1} d="M24 16a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM24 6v6m0 24v6M6 24h6m24 0h6M11 11l4 4m18 18 4 4M37 11l-4 4M15 33l-4 4" />
  </svg>,
  <svg key="follow" viewBox="0 0 48 48">
    <path pathLength={1} d="M24 5l14 5v11c0 9-6 16-14 20-8-4-14-11-14-20V10z" />
    <path pathLength={1} d="M17 23l5 5 9-10" />
  </svg>,
];

/** Plays `run` once when `el` scrolls into view, unless motion is paused (then the end state shows). */
function useOnView(ref: React.RefObject<HTMLElement | null>, run: () => void, threshold = 0.25) {
  const { pausedRef } = useSite();
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (!pausedRef.current) runRef.current();
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, pausedRef, threshold]);
}

export function CorporatePage() {
  const { theme, paused, togglePaused, pausedRef } = useSite();
  const active = theme === "corporate";
  const tagline = useRef<HTMLParagraphElement>(null);
  const steps = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLDivElement>(null);
  const team = useRef<HTMLParagraphElement>(null);
  const cases = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLElement>(null);
  const [years, setYears] = useState(20);
  // Pre-hidden entrance states apply only while motion runs; paused, reduced motion or no JS
  // leave everything visible.
  const [motionOn, setMotionOn] = useState(false);
  useEffect(() => {
    setMotionOn(active && !paused);
  }, [active, paused]);

  // Hero tagline types itself in, character by character, behind a blinking caret.
  useEffect(() => {
    const el = tagline.current;
    if (!el || !active || pausedRef.current) return;
    const split = splitText(el, { chars: true });
    utils.set(split.chars, { opacity: 0 });
    const typing = animate(split.chars, { opacity: [0, 1], duration: 1, delay: stagger(55, { start: 350 }) });
    return () => {
      typing.cancel();
      split.revert();
    };
  }, [active, pausedRef]);

  // Section headings and blocks rise in as they enter.
  useEffect(() => {
    const root = reveal.current;
    if (!root || !active) return;
    const targets = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
    if (pausedRef.current) return;
    targets.forEach((t) => {
      if (t.getBoundingClientRect().top > innerHeight * 0.95) utils.set(t, { opacity: 0, y: 28 });
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          animate(e.target, { opacity: 1, y: 0, duration: 800, ease: "outQuart" });
        }),
      { threshold: 0.15 },
    );
    targets.forEach((t) => io.observe(t));
    return () => {
      io.disconnect();
      targets.forEach((t) => {
        utils.remove(t);
        t.style.opacity = "";
        t.style.transform = "";
      });
    };
  }, [active, pausedRef]);

  // Step icons draw their strokes; step text follows.
  useOnView(steps, () => {
    const root = steps.current!;
    animate(root.querySelectorAll("svg path"), { strokeDashoffset: [1, 0], duration: 1100, delay: stagger(120), ease: "inOutQuad" });
    animate(root.querySelectorAll(".ca-step"), { opacity: [0, 1], y: [16, 0], duration: 700, delay: stagger(140), ease: "outCubic" });
  });

  // Comparison cards slide in from the right, one after another.
  useOnView(cards, () => {
    animate(cards.current!.querySelectorAll(".ca-card-slot"), { opacity: [0, 1], x: [60, 0], duration: 800, delay: stagger(120), ease: "outExpo" });
  });

  // "20 năm" counts up, and the red sweep underlines "không được phép sai".
  useOnView(
    team,
    () => {
      const counter = { v: 0 };
      animate(counter, { v: 20, duration: 1400, ease: "outExpo", onUpdate: () => setYears(Math.round(counter.v)) });
      team.current!.classList.add("is-swept");
    },
    0.6,
  );

  useCaseTilt(cases);

  // Case images wipe open from the top.
  useOnView(cases, () => {
    animate(cases.current!.querySelectorAll(".ca-case-media"), {
      clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
      duration: 1000,
      delay: stagger(150),
      ease: "inOutQuart",
    });
  });

  return (
    <div className="corporate-page" ref={reveal as React.RefObject<HTMLDivElement>} data-motion={motionOn ? "" : undefined}>
      <a className="skip" href="#ca-main">
        Đến nội dung
      </a>
      <header className="ca-header">
        <a href="#ca-hero" className="ca-brand" aria-label="THEHEGEO trang chủ">
          <Logo className="brand-logo" />
        </a>
        <nav aria-label="Điều hướng chính">
          {NAV.map((n, i) => (
            <a key={n.label} href={n.href} className={i === 0 ? "is-current" : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ca-tools">
          <span className="ca-lang">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
            </svg>
            VI
          </span>
        </div>
      </header>

      <main id="ca-main">
        <section className="ca-hero" id="ca-hero">
          <Plexus className="ca-plexus ca-plexus-hero" density={2.2} />
          <div className="ca-wrap ca-hero-copy">
            <h1>GEOagents</h1>
            <p className="ca-tagline" ref={tagline}>
              A workforce you can count on
            </p>
            <p className="ca-lead">
              GEO Agent nhận nhiệm vụ từ văn bản và theo đến khi xong. Chạy tại chỗ, dữ liệu ở lại với khách hàng,
              con người duyệt mọi bước quan trọng.
            </p>
            <a className="ca-pill" href="#ca-demo">
              Đặt lịch demo · Xem GEO Agent làm việc
            </a>
          </div>
          <div className="ca-hero-demo">
            <HeroDemo />
          </div>
        </section>

        <section className="ca-what" id="ca-what">
          <div className="ca-what-banner">
          <div className="ca-wrap ca-what-head" data-reveal>
            <div className="ca-what-copy">
            <h2>
              <span>GEO Agent</span>
              <br />
              là gì?
            </h2>
            <p>
              GEO Agent là trợ lý AI làm việc bên trong cơ quan, doanh nghiệp: đọc văn bản, xác định việc cần làm, ai
              làm, hạn nào, rồi theo dõi đến khi việc xong.
            </p>
            <div className="ca-what-points">
              {["Đọc văn bản", "Theo dõi nhiệm vụ", "Con người duyệt"].map((text, index) => <span key={text}>
                {STEP_ICONS[index]}<span>{text}</span>
              </span>)}
            </div>
            </div>
            <AgentWorkflow />
          </div>
          </div>
          <div className="ca-wrap ca-three-steps" ref={steps}>
          <h3 className="ca-kicker" data-reveal>
            GEO Agent làm việc qua ba bước
          </h3>
          <StepFlow icons={STEP_ICONS} />
          </div>
        </section>

        <section className="ca-diff" id="ca-diff">
          <Plexus className="ca-plexus ca-plexus-side" density={1.6} />
          <div className="ca-wrap">
            <h2 data-reveal>
              <span>GEO Agent</span> khác ở đâu?
            </h2>
            <div className="ca-cards" ref={cards}>
              {DIFF.map((d, i) => (
                // The slot carries the entrance slide; the card inside keeps its own skew transform.
                <div key={i} className="ca-card-slot">
                <article className={`ca-card${d.filled ? " is-filled" : ""}`}>
                  <div className="ca-card-inner">
                    <b className="ca-card-num">{i + 1}.</b>
                    <p className="ca-card-usual">
                      <span>Thường thấy</span>
                      {d.usual}
                    </p>
                    <p className="ca-card-geo">
                      <span>GeoAgent</span>
                      {d.geo}
                    </p>
                  </div>
                </article>
                </div>
              ))}
            </div>
            <p className="ca-team" id="ca-team" ref={team}>
              Phía sau GEO Agent là đội ngũ <b className="ca-years">{years}</b> năm làm những công trình{" "}
              <em>không được phép sai</em>: cầu dây văng, cảng biển, metro...
            </p>
          </div>
        </section>

        <Sovereignty />

        <section className="ca-cases" id="ca-cases">
          <div className="ca-wrap">
            <h2 data-reveal>GeoAgent đang làm việc ở đâu?</h2>
            <p className="ca-sub" data-reveal>
              Bài toán thật. Quy mô thật
            </p>
            <div className="ca-case-grid" ref={cases}>
              {CASES.map((c) => (
                <article className="ca-case" key={c.org}>
                  <div className="ca-case-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.img} alt="" width={960} height={600} loading="lazy" />
                  </div>
                  <h3>{c.org}</h3>
                  <p>{c.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <DemoForm />
      </main>

      <footer className="ca-footer">
        <div data-reveal>
          <ContactList className="ca-wrap" />
        </div>
        <div className="ca-wrap ca-legal">
          <span>© 2026 THEHEGEO</span>
          <button type="button" aria-pressed={paused} onClick={togglePaused}>
            {paused ? "Bật chuyển động ▷" : "Tạm dừng chuyển động Ⅱ"}
          </button>
        </div>
      </footer>
    </div>
  );
}

type Fields = { name: string; email: string; org: string; phone: string; brief: string };
const EMPTY: Fields = { name: "", email: "", org: "", phone: "", brief: "" };

function validate(f: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!f.name.trim()) errors.name = "Vui lòng nhập họ và tên.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = "Email chưa đúng định dạng.";
  if (!f.org.trim()) errors.org = "Vui lòng nhập tên doanh nghiệp hoặc cơ quan.";
  if (f.phone.replace(/\D/g, "").length < 9) errors.phone = "Số điện thoại cần ít nhất 9 chữ số.";
  if (f.brief.trim().length < 10) errors.brief = "Mô tả ngắn giúp chúng tôi chuẩn bị buổi demo (ít nhất 10 ký tự).";
  return errors;
}

/**
 * Demo request. There is no backend yet, so a valid request opens the visitor's email app with the
 * details filled in, addressed to the contact email from the design.
 * TODO(unconfirmed): replace with a real form endpoint or booking tool when one exists.
 */
function DemoForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof Fields) => (e: { target: { value: string } }) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`ca-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    const body = `Họ và tên: ${fields.name}\nEmail: ${fields.email}\nDoanh nghiệp/Cơ quan: ${fields.org}\nSố điện thoại: ${fields.phone}\n\nBài toán cần cải thiện:\n${fields.brief}`;
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Đặt lịch demo GEO Agent")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field = (k: keyof Fields, label: string, type: string, placeholder: string, autoComplete: string) => (
    <label className={`ca-field${errors[k] ? " has-error" : ""}`} htmlFor={`ca-${k}`}>
      <span>{label} *</span>
      <input
        id={`ca-${k}`}
        type={type}
        value={fields[k]}
        onChange={set(k)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `ca-${k}-err` : undefined}
      />
      {errors[k] && (
        <small id={`ca-${k}-err`} role="alert">
          {errors[k]}
        </small>
      )}
    </label>
  );

  return (
    <section className="ca-demo" id="ca-demo">
      <div className="ca-wrap">
        <h2 data-reveal>Xem GEO Agent làm việc trên văn bản thật</h2>
        <p className="ca-sub" data-reveal>
          Trình diễn trực tiếp với bộ văn bản mẫu.
          <br />
          Anh/chị không cần gửi tài liệu nào trước
        </p>
        <form className="ca-form" onSubmit={submit} noValidate data-reveal>
          <div className="ca-form-card">
            {field("name", "Họ và tên", "text", "Nguyễn Văn A", "name")}
            {field("email", "Email", "email", "ten@donvi.gov.vn", "email")}
            {field("org", "Doanh nghiệp/Cơ quan", "text", "Tên đơn vị của anh/chị", "organization")}
            {field("phone", "Số điện thoại", "tel", "09xx xxx xxx", "tel")}
            <label className={`ca-field ca-field-wide${errors.brief ? " has-error" : ""}`} htmlFor="ca-brief">
              <span>Mô tả ngắn bài toán hoặc nhiệm vụ cần cải thiện *</span>
              <textarea
                id="ca-brief"
                rows={3}
                value={fields.brief}
                onChange={set("brief")}
                placeholder="Ví dụ: theo dõi việc thực hiện văn bản chỉ đạo của UBND…"
                aria-invalid={!!errors.brief}
                aria-describedby={errors.brief ? "ca-brief-err" : undefined}
              />
              {errors.brief && (
                <small id="ca-brief-err" role="alert">
                  {errors.brief}
                </small>
              )}
            </label>
          </div>
          <button type="submit" className="ca-submit">
            Đặt lịch
          </button>
          <p className="ca-form-note" aria-live="polite">
            {sent ? `Đã mở ứng dụng email với nội dung yêu cầu, gửi tới ${CONTACT_EMAIL}.` : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
