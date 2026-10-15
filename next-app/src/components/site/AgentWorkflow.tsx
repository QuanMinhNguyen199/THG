"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSite } from "./SiteContext";

const LaptopScene = dynamic(() => import("./AgentWorkflowScene"), { ssr: false });
type Message = { id: number; role: "user" | "bot"; text: string };
type Stream = { role: Message["role"]; text: string; index: number };
const SCRIPT: Omit<Message, "id">[] = [
  { role: "user", text: "Tóm tắt tài liệu mẫu giúp tôi." },
  { role: "bot", text: "Nexa lorem, vectora sim. Luma contexta → nova taska. Velora ipsum, synthora demo." },
  { role: "user", text: "Tiếp theo cần làm gì?" },
  { role: "bot", text: "Orbi nexum · prima, secunda, nova. Luma workflowa, humana valida. Finora ipsum." },
];
const REPLIES = [
  "Nexa lorem, vectora sim. Luma contexta → nova taska. Velora ipsum, synthora demo.",
  "Orbi nexum · prima, secunda, nova. Luma workflowa, humana valida. Finora ipsum.",
  "Syntha luma, nexora flux. Alpha contexta / beta operata / nova resulta. Lorem velora!",
];

function DemoChat({ visible, paused }: { visible: boolean; paused: boolean }) {
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "bot", text: "Xin chào! Gõ thử một tin nhắn để trò chuyện với GeoAgent minh họa." }]);
  const [stream, setStream] = useState<Stream | null>(null);
  const [draft, setDraft] = useState("");
  const [autoIndex, setAutoIndex] = useState(0);
  const [tabVisible, setTabVisible] = useState(true);
  const sequence = useRef(0);
  const history = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update(); document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  // Scripted turns continue indefinitely. A submitted message takes priority for one reply.
  useEffect(() => {
    if (!visible || !tabVisible || paused || stream) return;
    const timer = setTimeout(() => {
      const next = SCRIPT[autoIndex % SCRIPT.length];
      setStream({ ...next, index: 0 });
      setAutoIndex(value => value + 1);
    }, autoIndex === 0 ? 1800 : 1600);
    return () => clearTimeout(timer);
  }, [visible, tabVisible, paused, stream, autoIndex]);
  useEffect(() => {
    if (!stream || !visible || !tabVisible) return;
    const timer = setTimeout(() => {
      if (paused || stream.index >= stream.text.length) {
        setMessages(current => [...current.slice(-7), { id: ++sequence.current, role: stream.role, text: stream.text }]);
        setStream(null);
      } else setStream(current => current ? { ...current, index: Math.min(current.index + 3, current.text.length) } : null);
    }, paused ? 0 : stream.index === 0 && stream.role === "bot" ? 650 : 30);
    return () => clearTimeout(timer);
  }, [stream, visible, tabVisible, paused]);
  useEffect(() => {
    if (history.current) history.current.scrollTop = history.current.scrollHeight;
  }, [messages, stream]);
  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages(current => [...current.slice(-7), { id: ++sequence.current, role: "user", text }]);
    setDraft("");
    // Resume with a complete automatic question/answer pair after the manual reply.
    setAutoIndex(value => value + value % 2);
    setStream({ role: "bot", text: REPLIES[text.length % REPLIES.length], index: 0 });
  };
  return <div className="ca-laptop-chat">
    <div className="ca-laptop-topbar">
      <span className="ca-laptop-mark" aria-hidden="true">G</span>
      <strong>GeoAgent</strong><span className="ca-laptop-demo-tag">DEMO</span>
    </div>
    <div className="ca-laptop-workspace">
      <aside className="ca-laptop-sidebar" aria-hidden="true">
        <span className="ca-laptop-sidebar-heading">Không gian làm việc</span>
        <span className="ca-laptop-sidebar-current">Phiên minh họa</span>
        <span>Tài liệu mẫu</span><span>Nhiệm vụ</span>
        <div className="ca-laptop-sidebar-lines"><i /><i /><i /></div>
      </aside>
      <div className="ca-laptop-conversation">
        <div className="ca-laptop-session">Phiên làm việc mới <span>Phản hồi giả lập</span></div>
        <div className="ca-laptop-messages" ref={history} role="log" aria-label="Hội thoại minh họa" aria-live="off">
          {messages.map(message => <div className={`ca-laptop-message is-${message.role}`} key={message.id}>
            <span>{message.role === "bot" ? "GeoAgent" : "Bạn"}</span><p>{message.text}</p>
          </div>)}
          {stream && <div className={`ca-laptop-message is-${stream.role}`} aria-hidden="true">
            <span>{stream.role === "bot" ? "GeoAgent" : "Bạn"}</span>
            <p>{stream.index === 0 ? <span className="ca-laptop-typing">Đang soạn…</span> : stream.text.slice(0, stream.index)}<i className="ca-laptop-caret" /></p>
          </div>}
        </div>
        <form className="ca-laptop-composer" onSubmit={send}>
          <input aria-label="Nhắn tin với GeoAgent minh họa" placeholder="Nhắn tin thử với GeoAgent…" value={draft}
            maxLength={240} onChange={event => setDraft(event.target.value)} autoComplete="off" />
          <button type="submit" aria-label="Gửi tin nhắn minh họa" disabled={!draft.trim()}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
          </button>
        </form>
      </div>
    </div>
  </div>;
}

export function AgentWorkflow() {
  const { theme, paused } = useSite();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const banner = el.closest(".ca-what-banner");
    let inView = false;
    const syncBackground = () => banner?.toggleAttribute("data-in-view", inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncBackground();
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setReady(true);
    }, { threshold: 0.1 });
    observer.observe(el);
    document.addEventListener("visibilitychange", syncBackground);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncBackground);
      banner?.removeAttribute("data-in-view");
    };
  }, []);
  return <div className="ca-agent-workflow" ref={host}>
    <div className="ca-laptop-stage" role="group" aria-label="Laptop 3D với màn hình chat GeoAgent tương tác">
      {ready && theme === "corporate" && <LaptopScene><DemoChat visible={visible} paused={paused} /></LaptopScene>}
    </div>
  </div>;
}
