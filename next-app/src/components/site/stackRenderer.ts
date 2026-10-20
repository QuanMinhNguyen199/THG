// Decides, once per visit, whether the four-tier stack is drawn with WebGL (three.js) or stays on
// the CSS 3D version. WebGL is used only when the browser has a real GPU behind it and the device
// is not a low-end one; a device that turns out slow is remembered and gets CSS from the start
// on its next visit.

const KEY = "geo-stack-renderer";

export type StackRenderer = "gl" | "css";

/** Software renderers report themselves in the GPU string: remote desktops, VMs, blocklisted drivers. */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;

export function chooseRenderer(): StackRenderer {
  if (typeof window === "undefined") return "css";
  try {
    if (localStorage.getItem(KEY) === "css") return "css";
  } catch {
    // storage blocked: decide from the device alone
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "css";
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return "css";
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return "css";

  const canvas = document.createElement("canvas");
  const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
  if (!gl) return "css";
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return SOFTWARE.test(name) ? "css" : "gl";
}

/** The device could not hold the frame rate: use CSS from now on, including on the next visit. */
export function rememberCSS() {
  try {
    localStorage.setItem(KEY, "css");
  } catch {
    // nothing to remember with
  }
}
