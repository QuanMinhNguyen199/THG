// WebGL drawing of the four-tier stack (narrow screens, capable devices; see stackRenderer.ts).
//
// The CSS 3D stack stays in the page as the source of truth: it is laid out, animated and tapped
// as before, with its surfaces made transparent. Each frame this renderer reads the CSS transforms
// (world, decks) and block boxes straight from the DOM and rebuilds the same geometry in three.js,
// with a camera that reproduces the CSS perspective, so the lit solids sit exactly under the
// invisible buttons, the cables and the leader line. What WebGL adds is real light and material:
// glossy clear-coated solids reflecting a studio environment, a key, fill and rim light, shadows
// cast by the blocks onto their decks and neighbours, and a Fresnel edge glow (red on the lit
// lineage) in the material's shader. Nothing moves on its own, so it draws only on change.

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const PERSPECTIVE = 3200; // px, the .s3-scene CSS perspective
// CSS space has y down; three.js has y up. Conjugating by this flip turns one into the other.
const FLIP = new THREE.Matrix4().makeScale(1, -1, 1);

type Palette = { bg: THREE.Color; ink: THREE.Color; red: THREE.Color; deck: THREE.Color; side: THREE.Color; cap: THREE.Color; body: THREE.Color; edge: THREE.Color };

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitPlane = new THREE.PlaneGeometry(1, 1);

// Rounded boxes are built at their real size (rounding cannot survive a scale) and shared: sizes
// are snapped to whole px, so blocks of one size, and the heights a block passes through while it
// rises, reuse the same few geometries instead of rebuilding them every frame.
const rounded = new Map<string, RoundedBoxGeometry>();
function roundedBox(w: number, h: number, depth: number, radius: number) {
  const size = [Math.max(1, Math.round(w)), Math.max(1, Math.round(h)), Math.max(1, Math.round(depth))] as const;
  const key = `${size.join("|")}|${radius}`;
  let geometry = rounded.get(key);
  if (!geometry) {
    geometry = new RoundedBoxGeometry(...size, 3, Math.min(radius, ...size.map((v) => v / 2)));
    rounded.set(key, geometry);
  }
  return { geometry, size };
}

/** Puts a mesh on a rounded box in a parent's CSS-local space: [x, x+w] × [y, y+h] × [z0, z1]. */
function placeRounded(mesh: THREE.Mesh, parent: DOMMatrix, x: number, y: number, w: number, h: number, z0: number, z1: number, radius: number) {
  const { geometry, size } = roundedBox(w, h, z1 - z0, radius);
  mesh.geometry = geometry;
  // Scale the snapped geometry back to the exact size; the correction is a fraction of a px.
  const local = new DOMMatrix()
    .translate(x + w / 2, y + h / 2, (z0 + z1) / 2)
    .scale(w / size[0], h / size[1], Math.max(0.5, z1 - z0) / size[2]);
  mesh.matrix.copy(toThree(parent.multiply(local)));
}

/** A soft dark pool, baked once: the contact shadow (ambient occlusion) under each block. */
function contactTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "blur(10px)";
  ctx.fillStyle = "#000";
  ctx.fillRect(24, 24, 80, 80);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type Shaded = THREE.MeshPhysicalMaterial & { rim: { value: THREE.Color }; rimStrength: { value: number } };

/**
 * A glossy physical material with a Fresnel rim in its emissive term: edges that turn away from
 * the eye glow in the rim colour.
 */
function shaded(color: THREE.Color): Shaded {
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.82,
    metalness: 0.18,
    clearcoat: 0,
    clearcoatRoughness: 0.3,
  }) as Shaded;
  mat.rim = { value: new THREE.Color(0xffffff) };
  mat.rimStrength = { value: 0.06 };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uRim: mat.rim, uRimStrength: mat.rimStrength });
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uRim;\nuniform float uRimStrength;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float facing = abs(dot(normalize(normal), normalize(vViewPosition)));
        totalEmissiveRadiance += uRim * uRimStrength * pow(1.0 - facing, 2.5);`,
      );
  };
  return mat;
}

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string, fallback: string) => new THREE.Color(css.getPropertyValue(name).trim() || fallback);
  return {
    bg: color("--bg", "#0a0a0a"), ink: color("--white", "#ffffff"), red: color("--red", "#c1152b"),
    deck: color("--stack-deck", "#24282c"), side: color("--stack-side", "#41474d"),
    cap: color("--stack-cap", "#2c3137"), body: color("--stack-body", "#202429"), edge: color("--stack-edge", "#8a929b"),
  };
}
const mix = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, t);

/** A CSS DOMMatrix as a three.js matrix in y-up space. */
function toThree(m: DOMMatrix) {
  const out = new THREE.Matrix4().fromArray(Array.from(m.toFloat64Array()));
  return FLIP.clone().multiply(out).multiply(FLIP);
}

/** Box in a parent's CSS-local space: [x, x+w] × [y, y+h] × [z0, z1]. */
function boxMatrix(parent: DOMMatrix, x: number, y: number, w: number, h: number, z0: number, z1: number) {
  const local = new DOMMatrix().translate(x + w / 2, y + h / 2, (z0 + z1) / 2).scale(w, h, Math.max(0.01, z1 - z0));
  return toThree(parent.multiply(local));
}

const TEXT_SCALE = 4; // texture px per CSS px for deck names

/** The deck's name, printed along its front edge (a texture on that face). */
function nameTexture(text: string, w: number, h: number, color: string, background: string) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * TEXT_SCALE);
  canvas.height = Math.round(h * TEXT_SCALE);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const family = getComputedStyle(document.body).fontFamily;
  ctx.font = `600 ${9.5 * TEXT_SCALE}px ${family}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${0.08 * 9.5 * TEXT_SCALE}px`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), 10 * TEXT_SCALE, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export type StackGL = { update(): void; probe(ms?: number): Promise<number>; dispose(): void };

export function mountStackGL(scene: HTMLElement, world: HTMLElement): StackGL {
  // Geometry is drawn into the composer's multisampled target. Multisampling the
  // final canvas as well adds cost without smoothing that full-screen output quad.
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  // Modest supersampling also smooths thin edges in desktop mobile previews (DPR 1).
  const renderRatio = () => Math.min(2, Math.max(1.5, window.devicePixelRatio || 1));
  renderer.setPixelRatio(renderRatio());
  renderer.shadowMap.enabled = true;
  // Variance shadow maps blur well: shadow edges soften with distance, as under a real light.
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  const canvas = renderer.domElement;
  canvas.className = "s3-gl";
  canvas.setAttribute("aria-hidden", "true");
  scene.prepend(canvas);

  const stage = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, PERSPECTIVE * 4);
  // A studio environment for the clear-coat reflections (built once, direction-only).
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  stage.environment = environment;
  // The studio is bright: kept low, it adds gloss on the clear coat without washing out the colours.
  stage.environmentIntensity = 0.12;
  // Low fill and a stronger key: lit and shaded faces separate clearly, and the shadows read.
  const sky = new THREE.HemisphereLight(0xffffff, 0x101010, 0.3);
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.18); // lift shadows without flattening the key
  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  // Local red spill follows the selected block, illuminating its deck and neighbours.
  const spill = new THREE.PointLight(0xc1152b, 6, 100, 1);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); // the VSM blur hides the lower resolution
  key.shadow.radius = 7;
  key.shadow.blurSamples = 12;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.6;
  stage.add(sky, key, key.target, fill, fill.target, rim, rim.target, spill);

  const gl = renderer.getContext() as WebGL2RenderingContext;
  const supportedSamples = Array.from(
    gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA16F, gl.SAMPLES) as Int32Array,
  );
  const samples = Math.max(0, ...supportedSamples.filter((count) => count <= 4));
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples });
  const composer = new EffectComposer(renderer, target);
  const renderPass = new RenderPass(stage, camera);
  const outputPass = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(outputPass);
  canvas.dataset.postprocessing = "antialias-output";
  canvas.dataset.antialias = `msaa-${samples}`;
  let previousWidth = 0;
  let previousHeight = 0;
  let disposed = false;

  let palette = readPalette();
  const decks: { body: THREE.Mesh; faces: Shaded[]; label?: THREE.CanvasTexture; labelKey?: string }[] = [];
  const blocks: THREE.Mesh[] = [];
  const outlines: THREE.LineLoop[] = [];
  const outlineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.5, -0.5, 0), new THREE.Vector3(0.5, -0.5, 0),
    new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(-0.5, 0.5, 0),
  ]);
  const contacts: THREE.Mesh[] = [];
  const tierShadows: THREE.Mesh[] = [];
  const contactMap = contactTexture();
  const contactMaterial = new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, opacity: 0.35, depthWrite: false, color: 0x000000 });
  // Broad, faint ambient occlusion from the deck above. Directional shadows still
  // come from the key light; this fills in the soft indirect shadow between tiers.
  const tierShadowMaterial = new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, opacity: 0.16, depthWrite: false, color: 0x000000 });
  const material = (color: THREE.Color) => shaded(color);

  function ensure(deckCount: number, blockCount: number) {
    while (decks.length < deckCount) {
      // Box face order: +x, -x, +y, -y, +z, -z (three.js space). The CSS front edge is the -y face.
      const faces = Array.from({ length: 6 }, () => material(palette.ink));
      const body = new THREE.Mesh(unitBox, faces);
      body.matrixAutoUpdate = false;
      body.castShadow = body.receiveShadow = true;
      stage.add(body);
      decks.push({ body, faces });
      const shade = new THREE.Mesh(unitPlane, tierShadowMaterial);
      shade.matrixAutoUpdate = false;
      shade.renderOrder = 1;
      stage.add(shade);
      tierShadows.push(shade);
    }
    while (blocks.length < blockCount) {
      // One material per face (+x, -x, +y, -y, +z, -z): the top (+z) carries the tier's signal colour.
      const mesh = new THREE.Mesh(unitBox, Array.from({ length: 6 }, () => material(palette.ink)));
      mesh.matrixAutoUpdate = false;
      mesh.castShadow = mesh.receiveShadow = true;
      stage.add(mesh);
      blocks.push(mesh);
      const outline = new THREE.LineLoop(outlineGeometry, new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.35, toneMapped: false }));
      outline.matrixAutoUpdate = false;
      stage.add(outline);
      outlines.push(outline);
      const contact = new THREE.Mesh(unitPlane, contactMaterial);
      contact.matrixAutoUpdate = false;
      contact.renderOrder = 1;
      stage.add(contact);
      contacts.push(contact);
    }
  }

  function update() {
    if (disposed) return;
    const W = scene.clientWidth;
    const H = scene.clientHeight;
    if (!W || !H) return;
    const ratio = renderRatio();
    if (renderer.getPixelRatio() !== ratio) {
      renderer.setPixelRatio(ratio);
      composer.setPixelRatio(ratio);
    }
    if (W !== previousWidth || H !== previousHeight) {
      renderer.setSize(W, H, false);
      composer.setSize(W, H);
      // One texel of the composer's buffers, which are drawn at the device pixel ratio.
      previousWidth = W;
      previousHeight = H;
    }
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    // Camera reproduces CSS perspective: eye PERSPECTIVE px in front of the scene's centre.
    camera.aspect = W / H;
    camera.fov = (2 * Math.atan(H / 2 / PERSPECTIVE) * 180) / Math.PI;
    camera.position.set(W / 2, -H / 2, PERSPECTIVE);
    camera.lookAt(W / 2, -H / 2, 0);
    camera.updateProjectionMatrix();

    // Key light from the upper left and in front; the shadow camera covers the whole stack.
    key.position.set(W / 2 - 260, -H / 2 + 420, 700);
    key.target.position.set(W / 2, -H / 2, 0);
    fill.position.set(W / 2 + 420, -H / 2 + 80, 500);
    fill.target.position.set(W / 2, -H / 2, 0);
    rim.position.set(W / 2 + 60, -H / 2 + 600, -500);
    rim.target.position.set(W / 2, -H / 2, 0);
    const reach = Math.max(W, H);
    Object.assign(key.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 1, far: 3000 });
    key.shadow.camera.updateProjectionMatrix();

    // World transform about its centre, placed where the CSS lays it out inside the scene.
    const w = world.offsetWidth;
    const d = world.offsetHeight;
    const base = new DOMMatrix()
      .translate(world.offsetLeft + w / 2, world.offsetTop + d / 2)
      .multiply(new DOMMatrix(getComputedStyle(world).transform))
      .translate(-w / 2, -d / 2);

    const deckEls = [...world.querySelectorAll<HTMLElement>(".s3-deck")];
    const blockEls = [...world.querySelectorAll<HTMLElement>(".s3-block")];
    ensure(deckEls.length, blockEls.length);
    const slab = parseFloat(getComputedStyle(world).getPropertyValue("--slab")) || 3;
    const { bg, ink, red } = palette;
    const black = new THREE.Color(0x000000);

    let b = 0;
    deckEls.forEach((el, n) => {
      const deck = decks[n];
      const m = base.multiply(new DOMMatrix(getComputedStyle(el).transform));
      placeRounded(deck.body, m, 0, 0, w, d, -slab, 0, 0.4);
      const tierShadow = tierShadows[n];
      tierShadow.visible = n > 0;
      // A diffuse footprint, gently shifted away from the upper-left key.
      tierShadow.matrix.copy(boxMatrix(m, w * 0.03, d * 0.04, w * 0.98, d * 1.1, 0.25, 0.25));
      const active = el.classList.contains("is-active");
      const top = palette.deck;
      const side = active ? red : palette.side;
      deck.faces.forEach((f, i) => {
        f.color.copy(i === 4 ? top : side);
        f.rim.value.copy(active ? red : ink);
        f.rimStrength.value = active ? 0.05 : 0.025;
      });

      // Deck name on the front edge (re-drawn only when its text, size or colour changes).
      // Tier names live in the readable, flat controls beside the stack.
      const text = "";
      const textColor = active ? "#ffffff" : `#${mix(side, ink, 0.6).getHexString()}`;
      const background = `#${side.getHexString()}`;
      const labelKey = `${text}|${w}|${slab}|${textColor}|${background}`;
      if (deck.labelKey !== labelKey) {
        deck.label?.dispose();
        deck.label = nameTexture(text, w, slab, textColor, background);
        deck.labelKey = labelKey;
        deck.faces[3].map = deck.label;
        deck.faces[3].needsUpdate = true;
      }
      // The texture carries the edge colour; the face itself stays white so it is not tinted twice.
      deck.faces[3].color.set(0xffffff);


      el.querySelectorAll<HTMLElement>(".s3-block").forEach((block) => {
        const contact = contacts[b];
        const outline = outlines[b];
        const mesh = blocks[b++];
        const h = parseFloat(getComputedStyle(block).getPropertyValue("--h")) || 10;
        const bx = block.offsetLeft;
        const by = block.offsetTop;
        const bw = block.offsetWidth;
        const bh = block.offsetHeight;
        placeRounded(mesh, m, bx, by, bw, bh, 0, h, 0.35);
        outline.matrix.copy(boxMatrix(m, bx + 1, by + 1, bw - 2, bh - 2, h + 0.3, h + 0.3));
        // Contact shadow on the deck top, a little wider than the block and pushed away from the light.
        contact.matrix.copy(boxMatrix(m, bx - 3, by - 2, bw + 9, bh + 8, 0.4, 0.4));
        // Graphite modules; red lives only on the top face, as a signal: a deep red on the lineage,
        // a lit red on the pick. The pick's body also takes a dark red, so it reads at a glance.
        const faces = mesh.material as Shaded[];
        const picked = block.classList.contains("is-picked");
        if (picked) {
          spill.position.setFromMatrixPosition(mesh.matrix);
          spill.position.z += 28;
          spill.color.copy(red);
        }
        const lit = block.classList.contains("is-lit");
        const body = palette.body;
        const cap = picked ? red : palette.cap;
        const edge = outline.material as THREE.LineBasicMaterial;
        edge.color.copy(picked || lit ? red : palette.edge);
        edge.opacity = picked ? 1 : lit ? 0.6 : 0.32;
        faces.forEach((f, i) => {
          const isTop = i === 4;
          f.color.copy(isTop ? cap : body);
          // Tint reflections on red surfaces instead of adding a milky white highlight.
          f.metalness = 0.25;
          f.emissive.copy(black);
          // HDR emission feeds bloom without whitening the entire top face.
          f.emissiveIntensity = 0;
          f.rim.value.copy(picked || (isTop && lit) ? red : ink);
          // Kept below the bloom threshold on the sides: an overbright rim there blooms past the
          // block's silhouette.
          f.rimStrength.value = picked ? 0.08 : 0.025;
        });
      });
    });
    // Nothing moves on its own: a frame is drawn only when the layout or state changes.
    composer.render();
  }

  // Theme switches recolour everything.
  const themes = new MutationObserver(() => {
    palette = readPalette();
    decks.forEach((deck) => (deck.labelKey = undefined));
    update();
  });
  themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /**
   * Renders continuously for `ms` and returns the frames per second the device managed. Shaders
   * are compiled and a few frames drawn first, so one-off start-up work does not count against
   * the device.
   */
  function probe(ms = 1200, warmup = 8) {
    update();
    renderer.compile(stage, camera);
    return new Promise<number>((resolve) => {
      let frames = -warmup;
      let start = 0;
      const step = (now: number) => {
        if (disposed) { resolve(0); return; }
        update();
        frames++;
        if (frames === 0) start = now;
        if (frames <= 0 || now - start < ms) requestAnimationFrame(step);
        else resolve((frames * 1000) / (now - start));
      };
      requestAnimationFrame(step);
    });
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    themes.disconnect();
    contactMap.dispose();
    decks.forEach((deck) => deck.label?.dispose());
    contactMaterial.dispose();
    tierShadowMaterial.dispose();
    rounded.forEach((geometry) => geometry.dispose());
    rounded.clear();
    environment.dispose();
    pmrem.dispose();
    decks.forEach((deck) => {
      deck.faces.forEach((f) => f.dispose());
    });
    blocks.forEach((mesh) => (mesh.material as THREE.Material[]).forEach((f) => f.dispose()));
    outlines.forEach((edge) => (edge.material as THREE.Material).dispose());
    outlineGeometry.dispose();
    outputPass.dispose();
    renderPass.dispose();
    composer.dispose();
    renderer.dispose();
    canvas.remove();
  }

  return { update, probe, dispose };
}
