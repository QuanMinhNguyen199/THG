"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { projects, type ProjectId } from "./content";

export function Applications() {
  const [open, setOpen] = useState<ProjectId | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  // Native <dialog> keeps focus trapping, Escape and the backdrop behaviour of the static site.
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  const close = () => dialog.current?.close();
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target !== dialog.current) return;
    const r = dialog.current.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  };
  const project = open ? projects[open] : null;

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
        <div className="projects">
          <button className="project tax" onClick={() => setOpen("tax")}>
            <div className="project-visual">
              <div className="document">
                <span>AI / TAX INTELLIGENCE</span>
                <b>
                  Đúng dữ liệu.
                  <br />
                  Rõ nghĩa vụ.
                </b>
                <div className="document-line" />
                <div className="document-line short" />
                <div className="doc-stamp">
                  TAX
                  <br />
                  360
                </div>
              </div>
              <span className="visual-index">{projects.tax.index}</span>
            </div>
            <ProjectInfo id="tax" />
          </button>
          <button className="project engineering" onClick={() => setOpen("ptsc")}>
            <div className="project-visual">
              <div className="blueprint">
                <span />
                <span />
                <span />
                <span />
                <i />
              </div>
              <span className="visual-index">{projects.ptsc.index}</span>
            </div>
            <ProjectInfo id="ptsc" />
          </button>
        </div>
      </section>

      <dialog ref={dialog} id="project-dialog" onClose={() => setOpen(null)} onClick={onBackdrop}>
        <button className="close" aria-label="Đóng" onClick={close}>
          ×
        </button>
        <p className="dialog-label">ỨNG DỤNG GEOAGENTS</p>
        <h2>{project?.name}</h2>
        <p className="dialog-company">{project?.company}</p>
        <p className="dialog-description">{project?.description}</p>
        <button className="button close-text" onClick={close}>
          Tiếp tục khám phá <span>→</span>
        </button>
      </dialog>
    </>
  );
}

function ProjectInfo({ id }: { id: ProjectId }) {
  const p = projects[id];
  return (
    <>
      <div className="project-info">
        <div>
          <h3>{p.name}</h3>
          <p>{p.company}</p>
        </div>
        <span className="project-arrow">↗</span>
      </div>
      <p className="project-desc">{p.summary}</p>
    </>
  );
}
