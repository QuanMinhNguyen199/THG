"use client";

// Contact form. There is no form backend yet, so sending opens the visitor's mail app with the
// details filled in, addressed to the company's contact email.
import { useState, type FormEvent } from "react";
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

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
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

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        <span>Họ tên</span>
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        <span>Cơ quan</span>
        <input name="org" required autoComplete="organization" />
      </label>
      <label>
        <span>Loại cơ quan</span>
        <select name="kind" required defaultValue="">
          <option value="" disabled>
            Chọn loại cơ quan
          </option>
          {KINDS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Tỉnh/thành</span>
        <select name="province" required defaultValue="">
          <option value="" disabled>
            Chọn tỉnh/thành
          </option>
          {PROVINCES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="is-wide">
        <span>Email công việc</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="is-wide">
        <span>Bài toán muốn giải</span>
        <textarea name="problem" rows={5} required />
      </label>
      <div className="is-wide contact-submit">
        <button type="submit" className="button">
          Gửi yêu cầu
        </button>
        {sent && <p role="status">Ứng dụng email của anh/chị đã được mở để gửi yêu cầu.</p>}
      </div>
    </form>
  );
}
