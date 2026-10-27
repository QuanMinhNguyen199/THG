import Link from "next/link";
import type { PageBlock } from "@/content/blocks";
import { asset } from "@/lib/asset";
import { HomeHero } from "../site/HomeHero";
import { HomeTiers } from "../site/HomeTiers";
import { HomeDemo } from "../site/HomeDemo";
import { Metrics } from "../site/Metrics";
import { Cta } from "../site/Cta";
import { PartnerMark } from "../site/PartnerMark";

const Arrow = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>;

function Block({ block }: { block: PageBlock }) {
  const titleId = `block-${block.id}-title`;
  const anchor = block.anchor || `block-${block.id}`;
  switch (block.blockType) {
    case "homeHero": return <HomeHero heading={block.heading} id={anchor} />;
    case "metrics": return <Metrics items={block.items} label={block.label} id={anchor} />;
    case "cta": return <Cta data={block} id={anchor} titleId={titleId} />;
    case "partners": return (
      <section className="wrap home-partners" id={anchor} aria-labelledby={titleId}>
        <h2 id={titleId}>{block.title}</h2>
        <div className="partner-marquee"><div className="partner-track">
          {[0, 1].map(copy => <ul key={copy} aria-hidden={copy === 1 || undefined}>
            {block.items.map((item, index) => <li key={index}><PartnerMark name={item.name} eager /></li>)}
          </ul>)}
        </div></div>
        <Link className="home-link" href={block.href} scroll={false}>{block.linkLabel} <Arrow /></Link>
      </section>
    );
    case "coreShowcase": return (
      <section className="wrap home-split" id={anchor} aria-labelledby={titleId}>
        <div className="home-split-copy">
          <p className="home-kicker">{block.kicker}</p>
          <h2 id={titleId}>{block.title}<br /><span>{block.highlight}</span></h2>
          <ul className="home-tiers">{block.items.map((item, index) => <li key={index}><strong>{item.product}</strong><span>{item.label}</span></li>)}</ul>
          <Link className="home-link" href={block.href} scroll={false}>{block.linkLabel} <Arrow /></Link>
        </div>
        <HomeTiers names={block.items} />
      </section>
    );
    case "agentDemo": return (
      <section className="wrap home-split is-reverse" id={anchor} aria-labelledby={titleId}>
        <HomeDemo />
        <div className="home-split-copy">
          <p className="home-kicker">{block.kicker}</p>
          <h2 id={titleId}>{block.title}<br /><span>{block.highlight}</span></h2>
          <p className="home-lead">{block.body}</p>
        </div>
      </section>
    );
    case "navigationTiles": return (
      <section className="wrap home-tiles" id={anchor} aria-labelledby={titleId}>
        <h2 id={titleId} className="home-tiles-title">{block.title} <span>{block.highlight}</span></h2>
        <div className="home-grid">{block.items.map((tile, index) => (
          <Link key={index} href={tile.href} scroll={false} className={`home-tile ${tile.size === "wide" ? "is-wide" : ""}${tile.image ? " has-image" : ""}`}>
            {tile.image && <img src={/^(https?:)?\/\//.test(tile.image) ? tile.image : asset(tile.image)} alt="" loading="lazy" />}
            <span className="home-tile-body">
              <span className="home-tile-head"><strong>{tile.label}</strong><Arrow /></span>
              <ul>{tile.items.map((item, i) => <li key={i}>{item.text}</li>)}</ul>
            </span>
          </Link>
        ))}</div>
      </section>
    );
    default: {
      const unexpected: never = block;
      throw new Error(`Unsupported block: ${JSON.stringify(unexpected)}`);
    }
  }
}

export function RenderBlocks({ blocks }: { blocks: PageBlock[] }) {
  return blocks.filter(block => block.enabled !== false).map(block => <Block key={block.id} block={block} />);
}
