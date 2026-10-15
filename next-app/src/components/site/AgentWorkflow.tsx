"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useSite } from "./SiteContext";

const WorkflowScene = dynamic(() => import("./AgentWorkflowScene"), { ssr: false });
const STEPS = [
  { name: "Yêu cầu", detail: "Tiếp nhận văn bản và xác định nhiệm vụ cần giải quyết." },
  { name: "Agent xử lý", detail: "Kết nối dữ liệu, sử dụng công cụ và chuẩn bị phương án thực hiện." },
  { name: "Con người duyệt", detail: "Dừng tại bước quan trọng để người có thẩm quyền xem xét và phê duyệt." },
  { name: "Kết quả", detail: "Sau khi được duyệt, tiếp tục thực hiện và theo dõi kết quả công việc." },
];

export function AgentWorkflow() {
  const { theme, paused } = useSite();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timeline = useRef(0);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setReady(true);
    }, { rootMargin: "80px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const choose = (index: number) => {
    timeline.current = [0.8, 2.8, 5.5, 8.3][index];
    setPlaying(false);
    setStep(index);
  };
  return <div className="ca-agent-workflow" ref={host}>
    <div className="ca-agent-canvas" role="img" aria-label="Mô hình 3D: yêu cầu kết nối tới Agent, qua con người phê duyệt rồi mới tạo kết quả. Minh họa quy trình, không chứa dữ liệu thật.">
      {ready && theme === "corporate" && <WorkflowScene timeline={timeline} step={step} onStep={setStep}
        running={visible && playing && !paused} />}
    </div>
    <div className="ca-agent-steps" role="group" aria-label="Khám phá quy trình GeoAgent">
      {STEPS.map((item, index) => <button key={item.name} type="button" aria-pressed={step === index}
        aria-controls="ca-agent-detail" onClick={() => choose(index)}>
        <span className="ca-agent-step-dot" aria-hidden="true" />{item.name}
      </button>)}
    </div>
    <p id="ca-agent-detail" className="ca-agent-detail">{STEPS[step].detail}</p>
    <div className="ca-agent-caption">
      <span>Minh họa quy trình · Con người giữ quyền quyết định</span>
      <button type="button" disabled={paused} onClick={() => setPlaying(value => !value)}
        aria-label={playing ? "Tạm dừng mô hình 3D" : "Phát mô hình 3D"}>
        {paused ? "Chuyển động đã tắt" : playing ? "Tạm dừng" : "Phát mô hình"}
      </button>
    </div>
  </div>;
}
