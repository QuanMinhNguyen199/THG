import home from "./pages/home.json";
import type { PageDocument } from "./blocks";
import collection from "./payload/pages.collection.json";
import { validateDocument } from "./validate.mjs";

/** Content source boundary: later replace the local lookup with a published Payload query.
 * Local JSON is validated by check:content before builds. No client-side CMS credentials.
 */
export function getPage(slug: "home"): PageDocument {
  if (slug !== "home") throw new Error(`Unknown page: ${slug}`);
  validateDocument(home, collection);
  return home as PageDocument;
}
