const DOMMatrixCompat = ((): typeof DOMMatrix => {
  if (typeof DOMMatrix !== "undefined") {
    return DOMMatrix;
  }

  // 尝试从 @napi-rs/canvas 加载 (Node.js 环境)
  try {
    // use iife to prevent static analysis
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const napiCanvas = require((() => "@napi-rs/canvas")()) as typeof import("@napi-rs/canvas");
    return napiCanvas.DOMMatrix as typeof DOMMatrix;
  } catch {
    throw new Error("DOMMatrix is not available. In Node.js, install @napi-rs/canvas.");
  }
})();

export { DOMMatrixCompat as DOMMatrix };
