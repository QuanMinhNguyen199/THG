import type { ReactNode } from "react";
import { EditorBridge } from "../cms/EditorBridge";
import { BackToTop, ScrollLight, ThemeDock } from "./Chrome";
import { ConceptEffects } from "./ConceptEffects";
import { Cta } from "./Cta";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SiteProvider } from "./SiteContext";

/**
 * The frame every site page shares: header, page fixtures, the closing call to action and the
 * footer. `subpage` pages have no hero under the fixed header, so their content starts below it.
 */
export function SiteShell({ children, subpage = false, cta = true }: { children: ReactNode; subpage?: boolean; cta?: boolean }) {
  return (
    <SiteProvider>
      {/* Gives every part of the page its content (published, or the content editor's drafts). */}
      <EditorBridge>
        <div className={`shared-page${subpage ? " is-subpage" : ""}`}>
          <div className="bg-grid" aria-hidden="true" />
          <a className="skip" href="#main">
            Đến nội dung
          </a>
          <Header />
          <ScrollLight />
          <main id="main">
            {children}
            {cta && <Cta />}
            <Footer />
          </main>
        </div>
        <BackToTop />
        <ThemeDock />
        <ConceptEffects />
      </EditorBridge>
    </SiteProvider>
  );
}
