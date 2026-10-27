"use client";

// Contact form. There is no form backend yet, so sending opens the visitor's mail app with the
// details filled in, addressed to the company's contact email.
import { cloneElement, useState, type FocusEvent, type FormEvent, type ReactElement } from "react";
import { APPLY_EMAIL } from "./catalog";

const KINDS = ["Cơ quan nhà nước", "Doanh nghiệp nhà nước", "Doanh nghiệp", "Đơn vị khác"];
// The 34 provinces and cities after the 2025 administrative reorganisation.
const PROVINCES = [
  "Hà Nội", "TP. Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Huế", "Cần Thơ",
  "An Giang", "Bắc Ninh", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Điện Biên", "Đồng Nai", "Đồng Tháp",
  "Gia Lai", "Hà Tĩnh", "Hưng Yên", "Khánh Hòa", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai",
  "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sơn La", "Tây Ninh",
  "Thái Nguyên", "Thanh Hóa", "Tuyên Quang", "Vĩnh Long",
];

type Field = "name" | "org" | "kind" | "province" | "email" | "problem";
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// Vietnamese messages instead of the browser's own, which follow the browser language.
const EMPTY: Record<Field, string> = {
  name: "Vui lòng nhập họ tên.",
  org: "Vui lòng nhập tên cơ quan.",
  kind: "Vui lòng chọn loại cơ quan.",
  province: "Vui lòng chọn tỉnh/thành.",
  email: "Vui lòng nhập email công việc.",
  problem: "Vui lòng mô tả bài toán muốn giải.",
};
const check = (el: Control) => {
  const name = el.name as Field;
  if (!el.value.trim()) return EMPTY[name];
  if (name === "email" && el.validity.typeMismatch) return "Email chưa đúng định dạng, ví dụ: ten@coquan.gov.vn.";
  return "";
};

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  // A field is re-checked when the visitor leaves it, once it has shown an error.
  const blur = (e: FocusEvent<Control>) => {
    const name = e.currentTarget.name as Field;
    if (errors[name] === undefined) return;
    const message = check(e.currentTarget);
    setErrors((all) => ({ ...all, [name]: message }));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const controls = Array.from(form.elements).filter((el): el is Control => "name" in el && (el as Control).name in EMPTY);
    const found = Object.fromEntries(controls.map((el) => [el.name, check(el)])) as Record<Field, string>;
    setErrors(found);
    const first = controls.find((el) => found[el.name as Field]);
    if (first) {
      setSent(false);
      first.focus();
      return;
    }
    const f = new FormData(form);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const body = [
      `Họ tên: ${get("name")}`,
      `Cơ quan: ${get("org")}`,
      `Loại cơ quan: ${get("kind")}`,
      `Tỉnh/thành: ${get("province")}`,
      `Email công việc: ${get("email")}`,
      "",
      "Bài toán muốn giải:",
      get("problem"),
    ].join("\n");
    location.href = `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(`Liên hệ từ website: ${get("org")}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  // Label, control and its error message, linked for screen readers.
  const field = (name: Field, label: string, control: ReactElement<Record<string, unknown>>, wide = false) => {
    const error = errors[name];
    return (
      <label className={wide ? "is-wide" : undefined}>
        <span>{label}</span>
        {cloneElement(control, {
          name,
          required: true,
          onBlur: blur,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${name}-error` : undefined,
        })}
        {error && (
          <small id={`${name}-error`} className="field-error">
            {error}
          </small>
        )}
      </label>
    );
  };

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      {field("name", "Họ tên", <input autoComplete="name" />)}
      {field("org", "Cơ quan", <input autoComplete="organization" />)}
      {field(
        "kind",
        "Loại cơ quan",
        <select defaultValue="">
          <option value="" disabled>
            Chọn loại cơ quan
          </option>
          {KINDS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>,
      )}
      {field(
        "province",
        "Tỉnh/thành",
        <select defaultValue="">
          <option value="" disabled>
            Chọn tỉnh/thành
          </option>
          {PROVINCES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>,
      )}
      {field("email", "Email công việc", <input type="email" autoComplete="email" />, true)}
      {field("problem", "Bài toán muốn giải", <textarea rows={5} />, true)}
      <div className="is-wide contact-submit">
        <button type="submit" className="button">
          Gửi yêu cầu
        </button>
        <p role="status">
          {sent && (
            <>
              Nội dung đã được soạn sẵn trong ứng dụng email. Nếu không thấy cửa sổ email mở ra, hãy gửi trực tiếp tới{" "}
              <a href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</a>.
            </>
          )}
        </p>
      </div>
    </form>
  );
}
