import type { LayoutNode } from "./layout/engine";
import { computeLayout } from "./layout/engine";
import { createCanvasMeasureContext } from "./layout/measure";
import { renderNode } from "./render";
import type { Element } from "./types/components";

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

export interface LayoutSize {
  width: number;
  height: number;
}

export interface DrawCallCanvas {
  readonly width: number;
  readonly height: number;
  readonly pixelRatio: number;
  render(element: Element): LayoutNode;
  clear(): void;
  getContext(): CanvasRenderingContext2D;
  toDataURL(type?: string, quality?: number): string;
  toBuffer(type?: "image/png" | "image/jpeg"): Buffer;
}

/**
 * 创建适用于浏览器环境的 Canvas
 *
 * 在浏览器环境中使用，支持传入已有的 canvas 实例
 */
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
  } else {
    // 浏览器环境，创建新的 canvas 元素
    const el = document.createElement("canvas");
    el.width = width * pixelRatio;
    el.height = height * pixelRatio;
    canvas = el;
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

    render(element: Element): LayoutNode {
      const layoutTree = computeLayout(element, measureCtx, {
        minWidth: 0,
        maxWidth: width,
        minHeight: 0,
        maxHeight: height,
      });
      renderNode(ctx, layoutTree);
      return layoutTree;
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

    toBuffer(type: "image/png" | "image/jpeg" = "image/png"): Buffer {
      if ("toBuffer" in canvas && typeof canvas.toBuffer === "function") {
        return canvas.toBuffer(type);
      }
      throw new Error("toBuffer not supported in this environment");
    },
  };
}
