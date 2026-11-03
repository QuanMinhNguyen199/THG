// Home's opening: the GEOagents video stage (the same film set, play/pause cursor and click
// feedback), waiting for a click to play like GEOagents, with no copy or buttons over it. The page heading stays for
// screen readers only.
import type { Film } from "@/content/blocks";
import { Hero } from "./Hero";

// An empty film field (null, "") keeps the default film or poster.
const set = (v?: string | null) => v || undefined;

export function HomeHero({ id, heading = "THEHEGEO: Công nghệ có tầm nhìn. Vận hành có chủ quyền.", video, videoSmall, poster }: { heading?: string; id?: string } & Film) {
  return (
    <Hero className="home-hero" id={id} video={set(video)} videoSmall={set(videoSmall)} poster={set(poster)}>
      <div className="hero-shade home-hero-shade" />
      <h1 className="sr-only">{heading}</h1>
    </Hero>
  );
}
