// Partners and their logo files (Về THEHEGEO, the home strip and the content editor's partner select).

// TODO(unconfirmed): only logos cleared for use may be shown; none are supplied yet, so the
// organisations are listed by name.
export const PARTNERS = [
  { group: "Cơ quan nhà nước", names: ["Bộ Xây dựng", "Thuế TP Hà Nội", "TP Hà Nội"] },
  { group: "Doanh nghiệp", names: ["PTSC M&C", "PV GAS South"] },
  { group: "Tổng thầu và tư vấn quốc tế", names: ["Taisei", "Sumitomo", "GS E&C", "Chodai", "Nippon Koei"] },
  { group: "Đô thị và giao thông quốc tế", names: ["Hongkong Telecom", "ACTi", "TMS"] },
  { group: "Viễn thông", names: ["VNPT", "Viettel", "CMC Telecom"] },
  { group: "Đối tác công nghệ", names: ["NVIDIA", "Dell", "HPE", "Intel"] },
];

/** Every partner, in the order above: the options of the home strip's partner select. */
export const PARTNER_NAMES = PARTNERS.flatMap((g) => g.names);

/**
 * Logo files in /public/partners, by partner name: the files supplied in the project's Logo folder,
 * trimmed, with any solid background removed, and sized for the web. `ratio` is the logo's width /
 * height, used to give every mark the same visual size (PartnerMark). `dark` is the version for the
 * dark theme: black and navy parts turned white, brand colours kept (NVIDIA: its official white
 * logo, with its own `darkRatio`).
 * TODO(unconfirmed): use of partner logos needs each partner's consent. TMS has no logo yet.
 */
export const PARTNER_LOGOS: Record<string, { src: string; ratio: number; dark?: string; darkRatio?: number }> = {
  "Bộ Xây dựng": { src: "/partners/bo-xay-dung.png", ratio: 1.14 },
  "Thuế TP Hà Nội": { src: "/partners/thue-ha-noi.png", ratio: 1.0 },
  "TP Hà Nội": { src: "/partners/tp-ha-noi.png", dark: "/partners/v2/tp-ha-noi-dark.png", ratio: 1.0 },
  "PTSC M&C": { src: "/partners/ptsc.png", dark: "/partners/v2/ptsc-dark.png", ratio: 1.72 },
  "PV GAS South": { src: "/partners/pv-gas.png", ratio: 1.42 },
  Taisei: { src: "/partners/taisei.png", dark: "/partners/v2/taisei-dark.png", ratio: 1.48 },
  Sumitomo: { src: "/partners/sumitomo.png", ratio: 7.08 },
  "GS E&C": { src: "/partners/gs.png", ratio: 1.97 },
  Chodai: { src: "/partners/chodai.png", dark: "/partners/v2/chodai-dark.png", ratio: 0.97 },
  "Nippon Koei": { src: "/partners/nippon-koei.png", ratio: 4.62 },
  "Hongkong Telecom": { src: "/partners/hkt.png", dark: "/partners/v2/hkt-dark.png", ratio: 2.65 },
  ACTi: { src: "/partners/acti.png", dark: "/partners/v2/acti-dark.png", ratio: 3.71 },
  VNPT: { src: "/partners/vnpt.png", ratio: 0.75 },
  Viettel: { src: "/partners/viettel.png", dark: "/partners/v2/viettel-dark.png", ratio: 2.89 },
  "CMC Telecom": { src: "/partners/cmc-telecom.png", ratio: 2.36 },
  NVIDIA: { src: "/partners/nvidia.png", ratio: 1.29, dark: "/partners/v2/nvidia-dark.svg", darkRatio: 5.47 },
  Dell: { src: "/partners/dell.png", ratio: 2.99 },
  HPE: { src: "/partners/hpe.png", dark: "/partners/v2/hpe-dark.png", ratio: 3.49 },
  Intel: { src: "/partners/intel.png", ratio: 1.52 },
};
