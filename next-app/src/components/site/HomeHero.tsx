// Home's opening: the GEOagents video stage (same film, same play/pause cursor and click
// feedback), waiting for a click to play like GEOagents, with no copy or buttons over it. The page heading stays for
// screen readers only.
import { Hero } from "./Hero";

export function HomeHero() {
  return (
    <Hero className="home-hero" video="/media/home-1080.mp4" videoSmall="/media/home-mobile.mp4" poster="/media/home-poster.jpg">
      <div className="hero-shade home-hero-shade" />
      <h1 className="sr-only">THEHEGEO: Công nghệ có tầm nhìn. Vận hành có chủ quyền.</h1>
    </Hero>
  );
}
