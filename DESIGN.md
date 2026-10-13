# GEOagents visual system

The supplied reference defines the visual authority: red technical linework and cinematic motion inspired by SpaceX. The user requested three switchable concepts: Charcoal (#0F172A) / Crimson (#DC2626), Navy (#0A192F) / Vibrant Red (#E53E3E), and Pure White (#FFFFFF) / Ruby Red (#E11D48).

## Typography and layout
Be Vietnam Pro supports Vietnamese body copy; Space Grotesk handles the brand and large metrics. Body copy uses warm gray, headings use off-white or #ff1644. The page uses an 88% width container, capped at 1240px. Desktop pairs artwork with copy; mobile stacks these and converts metrics to two columns.

## Motion
Anime.js 4.5.0 is vendored locally and owns floor illumination, panel changes, concept transitions and entrances. The architecture section uses native scrolling with a sticky viewport and four sequential steps. Scrolling backwards reverses focus. Clicking a layer navigates to its scroll position. Reduced-motion and pause controls settle transitions without suppressing the selected state. Offscreen canvases are skipped; paused frames are cached.

## Concepts
Charcoal preserves the cinematic right-hand hero with high-impact red CTA. Navy places the narrative on the left, adds a structured metric band and rounded B2B CTA. Ruby centers the brand on white, tones down circuitry and uses lighter type weights. Theme CSS variables also drive canvas colors. The floating switcher persists the choice locally; `?theme=charcoal`, `?theme=navy`, and `?theme=ruby` provide shareable entry points.

## Interaction
Native anchors navigate sections. Architecture uses keyboard-accessible vertical tabs. Two application cards open native dialogs with Escape dismissal. Mobile navigation exposes expanded state and closes on selection or Escape.

## Asset provenance
Logo mark, technical geometry, icons and application artwork are authored in code from the reference; no original brand asset files were supplied. Google Fonts supplies typefaces.
