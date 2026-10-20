import { Vector2 } from "three";

// Small HDR bloom kernel. Only overbright red emission blooms; pale graphite and white
// reflections stay sharp. Transparency is preserved so the page grid stays visible.
//
// The glow stays inside what the stack has drawn (decks and blocks): spilling into the canvas's
// transparent pixels would need its colour divided by a tiny alpha before tone mapping, which
// turns into hard, broken bright fringes along the blocks' outlines.
//
// The glow is gathered over a filled disc (a golden-angle spiral of taps with Gaussian weights)
// rather than along a few fixed directions: sparse directional taps leave flat streaks running out
// from the block's edges, while a dense disc spreads into a round, soft halo.
const TAPS = 28;
const RADIUS = 7; // px at the canvas's own resolution
const SIGMA = 3.2;

export const stackBloom = {
  uniforms: { tDiffuse: { value: null }, texel: { value: new Vector2(1, 1) } },
  vertexShader: `varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse;
    uniform vec2 texel;
    varying vec2 vUv;
    vec3 bright(vec2 uv) {
      vec4 s = texture2D(tDiffuse, uv);
      float redLight = smoothstep(0.85, 1.5, s.r) * smoothstep(0.12, 0.5, s.r - max(s.g, s.b));
      return s.rgb * redLight * s.a;
    }
    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      vec3 halo = vec3(0.0);
      float total = 0.0;
      for (int i = 0; i < ${TAPS}; i++) {
        float f = (float(i) + 0.5) / ${TAPS}.0;
        float r = sqrt(f) * ${RADIUS.toFixed(1)};
        float a = float(i) * 2.39996; // golden angle
        float w = exp(-(r * r) / (2.0 * ${SIGMA.toFixed(1)} * ${SIGMA.toFixed(1)}));
        halo += bright(vUv + vec2(cos(a), sin(a)) * r * texel) * w;
        total += w;
      }
      halo *= 0.55 / total;
      gl_FragColor = vec4(base.rgb + halo * base.a, base.a);
    }`,
};
