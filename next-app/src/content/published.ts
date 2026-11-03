// The published content: every stored document (registry.ts), built into what the site renders.
// Generated from DOCS; add the import here when a document is added there.
import doc_header from "@/content/globals/header.json";
import doc_footer from "@/content/globals/footer.json";
import doc_ways from "@/content/globals/ways-of-working.json";
import doc_page from "@/content/pages/home.json";
import doc_page_geoagents from "@/content/pages/geoagents.json";
import doc_page_giai_phap from "@/content/pages/giai-phap.json";
import doc_page_giai_phap_ai from "@/content/pages/giai-phap/ai.json";
import doc_page_giai_phap_aiot from "@/content/pages/giai-phap/aiot.json";
import doc_page_giai_phap_cong_nghe from "@/content/pages/giai-phap/cong-nghe.json";
import doc_page_giai_phap_tu_van from "@/content/pages/giai-phap/tu-van.json";
import doc_page_ung_dung from "@/content/pages/ung-dung.json";
import doc_page_ung_dung_hkd from "@/content/pages/ung-dung/hkd.json";
import doc_page_ung_dung_a360 from "@/content/pages/ung-dung/a360.json";
import doc_page_ung_dung_ai_platform from "@/content/pages/ung-dung/ai-platform.json";
import doc_page_ung_dung_quan_ly_du_an from "@/content/pages/ung-dung/quan-ly-du-an.json";
import doc_page_ve_thehegeo from "@/content/pages/ve-thehegeo.json";
import doc_page_ve_thehegeo_kinh_nghiem_du_an from "@/content/pages/ve-thehegeo/kinh-nghiem-du-an.json";
import doc_page_ve_thehegeo_su_menh_tam_nhin from "@/content/pages/ve-thehegeo/su-menh-tam-nhin.json";
import doc_page_ve_thehegeo_doi_tac from "@/content/pages/ve-thehegeo/doi-tac.json";
import doc_page_ve_thehegeo_lien_he from "@/content/pages/ve-thehegeo/lien-he.json";
import doc_page_tuyen_dung from "@/content/pages/tuyen-dung.json";
import doc_case_tdn from "@/content/cases/tdn.json";
import doc_case_dich_vu_cong from "@/content/cases/dich-vu-cong.json";
import doc_case_quan_ly_du_an from "@/content/cases/quan-ly-du-an.json";
import doc_case_ai_platform from "@/content/cases/ai-platform.json";
import doc_jobs from "@/content/jobs.json";
import { buildContent } from "./registry";

/** The stored documents by key (the editor starts its drafts from these). */
export const PUBLISHED: Record<string, unknown> = {
  "header": doc_header,
  "footer": doc_footer,
  "ways": doc_ways,
  "page:/": doc_page,
  "page:/geoagents": doc_page_geoagents,
  "page:/giai-phap": doc_page_giai_phap,
  "page:/giai-phap/ai": doc_page_giai_phap_ai,
  "page:/giai-phap/aiot": doc_page_giai_phap_aiot,
  "page:/giai-phap/cong-nghe": doc_page_giai_phap_cong_nghe,
  "page:/giai-phap/tu-van": doc_page_giai_phap_tu_van,
  "page:/ung-dung": doc_page_ung_dung,
  "page:/ung-dung/hkd": doc_page_ung_dung_hkd,
  "page:/ung-dung/a360": doc_page_ung_dung_a360,
  "page:/ung-dung/ai-platform": doc_page_ung_dung_ai_platform,
  "page:/ung-dung/quan-ly-du-an": doc_page_ung_dung_quan_ly_du_an,
  "page:/ve-thehegeo": doc_page_ve_thehegeo,
  "page:/ve-thehegeo/kinh-nghiem-du-an": doc_page_ve_thehegeo_kinh_nghiem_du_an,
  "page:/ve-thehegeo/su-menh-tam-nhin": doc_page_ve_thehegeo_su_menh_tam_nhin,
  "page:/ve-thehegeo/doi-tac": doc_page_ve_thehegeo_doi_tac,
  "page:/ve-thehegeo/lien-he": doc_page_ve_thehegeo_lien_he,
  "page:/tuyen-dung": doc_page_tuyen_dung,
  "case:tdn": doc_case_tdn,
  "case:dich-vu-cong": doc_case_dich_vu_cong,
  "case:quan-ly-du-an": doc_case_quan_ly_du_an,
  "case:ai-platform": doc_case_ai_platform,
  "jobs": doc_jobs,
};

export const CONTENT = buildContent(PUBLISHED);
