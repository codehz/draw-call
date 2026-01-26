import type { CanvasOptions, DrawCallCanvas } from "./canvas";
import type { LayoutNode } from "./layout/engine";
import { computeLayout } from "./layout/engine";
import { createCanvasMeasureContext } from "./layout/measure";
import { renderNode } from "./render";
import type { Element } from "./types/components";

// 导入 @napi-rs/canvas

import { createCanvas as createNapiCanvas } from "@napi-rs/canvas";

/**
 * 创建适用于 Node.js/Bun 环境的 Canvas
 *
 * 此函数需要 @napi-rs/canvas 作为依赖
 * 安装: bun add @napi-rs/canvas
 */
export function createCanvas(options: Omit<CanvasOptions, "canvas">): DrawCallCanvas {
  const { width, height, pixelRatio = 1 } = options;

  const canvas = createNapiCanvas(width * pixelRatio, height * pixelRatio);
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

    render(element: Element): LayoutNode {
      const layoutTree = computeLayout(element, measureCtx, {
        minWidth: 0,
        maxWidth: width,
        minHeight: 0,
        maxHeight: height,
      });
      renderNode(ctx as unknown as CanvasRenderingContext2D, layoutTree);
      return layoutTree;
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

    toBuffer(type: "image/png" | "image/jpeg" = "image/png"): Buffer {
      // @ts-expect-error 类型不匹配问题，强制转换
      return canvas.toBuffer(type);
    },
  };
}
