// Home's opening: the GEOagents video stage (the same film set, play/pause cursor and click
// feedback), waiting for a click to play like GEOagents, with no copy or buttons over it. The page heading stays for
// screen readers only.
import { Hero } from "./Hero";

export function HomeHero({ id, heading = "THEHEGEO: Công nghệ có tầm nhìn. Vận hành có chủ quyền." }: { heading?: string; id?: string }) {
  return (
    <Hero className="home-hero" id={id}>
      <div className="hero-shade home-hero-shade" />
      <h1 className="sr-only">{heading}</h1>
    </Hero>
  );
}
