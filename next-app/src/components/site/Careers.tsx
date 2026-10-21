// Recruitment section, linked from the top navigation ("Tuyển dụng").
import { CONTACT_EMAIL } from "./Contacts";

// TODO(unconfirmed): open positions and a dedicated recruitment address have not been provided.
// Until they are, the section invites applications to the general contact address and lists no
// specific roles rather than inventing them.
const APPLY_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Ứng tuyển THEHEGEO")}`;

/** The application call (also the "Vị trí đang tuyển" section of the recruitment page). */
export function CareersApply() {
  return (
    <div className="careers-apply">
      <p>Gửi CV và một vài dòng về việc bạn muốn làm. Chúng tôi sẽ liên hệ lại khi có vị trí phù hợp.</p>
      <a className="button" href={APPLY_HREF}>
        Gửi CV qua email
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </a>
    </div>
  );
}

export function Careers() {
  return (
    <section className="careers wrap" id="careers" aria-labelledby="careers-title">
      <div className="section-heading">
        <h2 id="careers-title">
          Tuyển dụng
          <br />
          <span>cùng THEHEGEO.</span>
        </h2>
        <p>
          Cùng xây dựng GEO Agent: trợ lý AI làm việc bên trong cơ quan, doanh nghiệp, chạy tại chỗ và
          để con người duyệt mọi bước quan trọng.
        </p>
      </div>
      <CareersApply />
    </section>
  );
}
