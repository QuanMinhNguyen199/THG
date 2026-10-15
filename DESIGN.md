# GEOagents visual system

The supplied reference defines the visual authority: red technical linework and cinematic motion inspired by SpaceX. The user requested three switchable concepts: Interactive Dark Tech (#0A0A0A, white text, #f22b2b accents), Corporate Motion Canvas (#FFFFFF, #0F172A headings, red primary actions) and Industrial High-End Dark (#121212 with soft red ambient glows).

## Typography and layout
The Next.js prototype uses Manrope across GEOagents (Dark Tech and Industrial), Corporate and Agent Native, including Vietnamese body copy, headings, navigation, controls and large metrics. One self-hosted variable font supplies the weights; the vector logo retains its original lettering. Body copy uses warm gray, headings use off-white or #ff1644. The page uses an 88% width container, capped at 1240px. Desktop pairs artwork with copy; mobile stacks these and converts metrics to two columns.

## Motion
Anime.js 4.5.0 is vendored locally and owns floor illumination, panel changes, concept transitions and entrances. The architecture section uses native scrolling with a sticky viewport and four sequential steps. Scrolling backwards reverses focus. Clicking a layer navigates to its scroll position. Reduced-motion and pause controls settle transitions without suppressing the selected state. Offscreen canvases are skipped; paused frames are cached.

## Concepts
Dark Tech keeps the cinematic right-hand hero, adds a fixed perspective grid behind the page that tilts toward the cursor, and gives red accents (buttons, nav, tabs, pillar icons, project cards) a glowing hover with a cursor-following spotlight. Corporate centers the brand on white, uses #0F172A for headings and #c1152b for actions (white text on it reaches 6.2:1), reveals section headings word by word with Anime.js `splitText`, fades content blocks up on entry, and adds lift, arrow nudge and press feedback to buttons and cards. Industrial places the narrative on the left with a structured metric band, wraps pillars, projects and metrics in soft red ambient shadows, breathes a glow around the transparent star logo, and drifts hero, headings and artwork at different scroll speeds using the CSS `translate` property. Concept effects live in `effects.css` and `effects.js`; all respect the pause control and reduced motion. The floating switcher persists the choice locally; `?theme=tech`, `?theme=corporate` and `?theme=industrial` are shareable, and the old `charcoal`, `ruby` and `navy` links still resolve.

## Interaction
Native anchors navigate sections. Architecture uses keyboard-accessible vertical tabs. Two application cards open native dialogs with Escape dismissal. Mobile navigation exposes expanded state and closes on selection or Escape.

## Asset provenance
The header uses `logo-dark.png` (the navy logo raster with its background keyed to transparency) on dark concepts and `logo-ruby.png` with multiply blending on Corporate, both in dist/assets. Technical geometry, icons and application artwork are authored in code. Google Fonts supplies typefaces.

## Local demo motion update
The four floors lift subtly during focus; light intensity and the connecting line interpolate over 950 ms through Anime.js. The footer wordmark is clipped to its top half and rises with an outBack overshoot when the page end is reached, without glow. A low-opacity vertical color band and edge line follow document progress. All are coordinated with reduced-motion and pause controls. The prototype is served at localhost:4175; this update stays local at the user's request.

## GEO Core network view

The Next.js app at localhost:4180 offers a GEO Core alternative to the four-tier tower. Its technical model illustrates source documents, context connections, a user request, a processing core and a conversation interface. The model uses scanned document planes, routed connections with GPU-driven packets and a layered processor with contact pins. The conversation and request windows contain only generic interface labels and geometric placeholder shapes. Never reproduce real conversations, questions, reports, dates, identifiers or numerical values from a supplied product screenshot. This is an explanatory model rather than a claim about GeoAgent's internal implementation.

Both modes must preserve the standard four tiers — Quản trị, Quản lý, Thực thi, Dịch vụ — and their original heading, introduction and descriptions. Core mode changes only the illustration. Scrolling takes the camera from distance 12.7 toward 4.2 along one continuous curve; the closest distance and framing adapt to the canvas aspect ratio so the processor and result interface remain fully visible, revealing the processor at closer range and bringing its technical detail into focus. A compact abstract conversation window appears alongside it. The core surface uses a quiet solid background and neutral controls with red technical accents. Canvas textures are released when the mode unmounts.

Wheel, touch and page navigation use native continuous scrolling. There is no wheel/touch interception or automatic tier snapping. Tabs use browser smooth scrolling, which the visitor can interrupt. A small selection deadband prevents text flicker near tier boundaries; the last tier has a short hold before the sticky scene ends. Actual scroll progress drives one continuous logarithmic camera curve, neural connection growth and core reveal. Nearby outer networks dissolve gradually. The scene renders only while visible, caps at 60 fps and freezes its clock for pause or reduced motion while preserving layer selection.

## Corporate workflow illustration

The GeoAgent introduction pairs its original copy with a light 3D workflow: request documents, an Agent processor, a human approval checkpoint and a result panel. Red packets stop at approval before output proceeds. Four accessible step buttons explain each stage; selecting one pauses the illustration, with an explicit playback control. The model loads near the viewport only in Corporate, renders at 30 fps while visible, stops in background tabs and respects site pause and reduced motion. Only geometric placeholders appear, with no customer data. Mobile stacks the model below the introduction.

