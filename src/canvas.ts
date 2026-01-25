import type { Element } from "./types/components";
import { computeLayout } from "./layout/engine";
import { createCanvasMeasureContext } from "./layout/measure";
import { renderNode } from "./render/engine";

export interface CanvasOptions {
  width: number;
  height: number;
  pixelRatio?: number;
  // 可选的 canvas 实例（浏览器环境使用 HTMLCanvasElement）
  canvas?: {
    getContext(type: "2d"): CanvasRenderingContext2D | null;
    width: number;
    height: number;
  };
}

export interface DrawCallCanvas {
  readonly width: number;
  readonly height: number;
  readonly pixelRatio: number;
  render(element: Element): void;
  clear(): void;
  getContext(): CanvasRenderingContext2D;
  toDataURL(type?: string, quality?: number): string;
  toBuffer(type?: "image/png" | "image/jpeg"): Promise<Buffer>;
}

// 动态导入 @napi-rs/canvas
async function loadNapiCanvas(): Promise<typeof import("@napi-rs/canvas") | null> {
  try {
    return await import("@napi-rs/canvas");
  } catch {
    return null;
  }
}

// 检测是否在浏览器环境
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

// 同步创建 canvas - 用于已有 canvas 实例的场景
export function createCanvas(options: CanvasOptions): DrawCallCanvas {
  const { width, height, pixelRatio = 1 } = options;

  let canvas: {
    getContext(type: "2d"): CanvasRenderingContext2D | null;
    width: number;
    height: number;
    toDataURL?(type?: string, quality?: number): string;
    toBuffer?(type: string): Buffer;
  };

  if (options.canvas) {
    canvas = options.canvas;
  } else if (isBrowser()) {
    // 浏览器环境
    const el = document.createElement("canvas");
    el.width = width * pixelRatio;
    el.height = height * pixelRatio;
    canvas = el;
  } else {
    throw new Error(
      "No canvas provided. In Node.js/Bun environment, use createCanvasAsync() or provide a canvas instance."
    );
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2d context");
  }

  // 应用像素比缩放
  if (pixelRatio !== 1) {
    ctx.scale(pixelRatio, pixelRatio);
  }

  const measureCtx = createCanvasMeasureContext(ctx);

  return {
    width,
    height,
    pixelRatio,

    render(element: Element): void {
      const layoutTree = computeLayout(element, measureCtx, {
        minWidth: 0,
        maxWidth: width,
        minHeight: 0,
        maxHeight: height,
      });
      renderNode(ctx, layoutTree);
    },

    clear(): void {
      ctx.clearRect(0, 0, width, height);
    },

    getContext(): CanvasRenderingContext2D {
      return ctx;
    },

    toDataURL(type?: string, quality?: number): string {
      if ("toDataURL" in canvas && typeof canvas.toDataURL === "function") {
        return canvas.toDataURL(type, quality);
      }
      throw new Error("toDataURL not supported");
    },

    async toBuffer(type: "image/png" | "image/jpeg" = "image/png"): Promise<Buffer> {
      if ("toBuffer" in canvas && typeof canvas.toBuffer === "function") {
        return canvas.toBuffer(type);
      }
      throw new Error("toBuffer not supported in this environment");
    },
  };
}

// 异步创建 canvas - 用于 Node.js/Bun 环境
export async function createCanvasAsync(
  options: Omit<CanvasOptions, "canvas">
): Promise<DrawCallCanvas> {
  const { width, height, pixelRatio = 1 } = options;

  if (isBrowser()) {
    return createCanvas(options);
  }

  // Node.js/Bun 环境，尝试加载 @napi-rs/canvas
  const napiCanvas = await loadNapiCanvas();
  if (!napiCanvas) {
    throw new Error(
      "@napi-rs/canvas is required in Node.js/Bun environment. Install it with: bun add @napi-rs/canvas"
    );
  }

  const canvas = napiCanvas.createCanvas(
    width * pixelRatio,
    height * pixelRatio
  );
  const ctx = canvas.getContext("2d");

  // 应用像素比缩放
  if (pixelRatio !== 1) {
    ctx.scale(pixelRatio, pixelRatio);
  }

  const measureCtx = createCanvasMeasureContext(ctx as unknown as CanvasRenderingContext2D);

  return {
    width,
    height,
    pixelRatio,

    render(element: Element): void {
      const layoutTree = computeLayout(element, measureCtx, {
        minWidth: 0,
        maxWidth: width,
        minHeight: 0,
        maxHeight: height,
      });
      renderNode(ctx as unknown as CanvasRenderingContext2D, layoutTree);
    },

    clear(): void {
      ctx.clearRect(0, 0, width, height);
    },

    getContext(): CanvasRenderingContext2D {
      return ctx as unknown as CanvasRenderingContext2D;
    },

    toDataURL(type?: string, quality?: number): string {
      return canvas.toDataURL(type as "image/png", quality);
    },

    async toBuffer(type: "image/png" | "image/jpeg" = "image/png"): Promise<Buffer> {
      // @ts-expect-error 类型不匹配问题，强制转换
      return canvas.toBuffer(type);
    },
  };
}
