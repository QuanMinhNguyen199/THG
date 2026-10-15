// Contact strip shared by every concept's footer: rounded line icons in soft circular badges.
// Colours come from the surrounding page via --ct-accent (icon + badge tint) and --ct-text.

export const CONTACT_EMAIL = "geotech@thehegeo.com";
// TODO(unconfirmed): the designs' phone number looks like a template placeholder.
const PHONE_LABEL = "(011) 6543 8974 210";
const PHONE_HREF = "tel:+01165438974210";

export function ContactList({ className = "" }: { className?: string }) {
  return (
    <div className={`contact-list ${className}`}>
      <a href={`mailto:${CONTACT_EMAIL}`}>
        <span className="ct-ico" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="3.5" y="5.5" width="17" height="13" rx="3.5" />
            <path d="M4.5 8l7.5 5.2L19.5 8" />
          </svg>
        </span>
        {CONTACT_EMAIL}
      </a>
      <a href={PHONE_HREF}>
        <span className="ct-ico" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7.2 4.5h2.2c.5 0 .9.3 1 .8l.9 3c.1.4 0 .8-.3 1.1l-1.4 1.3a11 11 0 0 0 3.7 3.7l1.3-1.4c.3-.3.7-.4 1.1-.3l3 .9c.5.1.8.5.8 1v2.2c0 1.1-.9 2-2 1.9A15.5 15.5 0 0 1 5.3 6.5c-.1-1.1.8-2 1.9-2z" />
          </svg>
        </span>
        {PHONE_LABEL}
      </a>
      <span>
        <span className="ct-ico" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 20.5c-3.6-3.6-6.5-7-6.5-10.3a6.5 6.5 0 0 1 13 0c0 3.3-2.9 6.7-6.5 10.3z" />
            <circle cx="12" cy="10.2" r="2.3" />
          </svg>
        </span>
        Trụ sở Hà Nội &amp; TP. Hồ Chí Minh
      </span>
    </div>
  );
}
