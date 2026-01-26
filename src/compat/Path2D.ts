const Path2DCompat = ((): typeof Path2D => {
  if (typeof Path2D !== "undefined") {
    return Path2D;
  }

  // 尝试从 @napi-rs/canvas 加载 (Node.js 环境)
  try {
    // use iife to prevent static analysis
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const napiCanvas = require((() => "@napi-rs/canvas")()) as typeof import("@napi-rs/canvas");
    return napiCanvas.Path2D as typeof Path2D;
  } catch {
    throw new Error("Path2D is not available. In Node.js, install @napi-rs/canvas.");
  }
})();

export { Path2DCompat as Path2D };
