import { createRawCanvas } from "@/compat";
import { computeLayout } from "@/layout/engine";
import { createCanvasMeasureContext } from "@/layout/utils/measure";
import { renderNode } from "@/render";
import type { LayoutElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";
import type { Canvas } from "@napi-rs/canvas";

export interface CanvasOptions<
  T extends HTMLCanvasElement | OffscreenCanvas | Canvas = HTMLCanvasElement | OffscreenCanvas | Canvas,
> {
  width: number;
  height: number;
  pixelRatio?: number;
  /** 根据内容调整画布大小 */
  fitContent?: boolean;
  updateStyles?: boolean;
  // 图像平滑选项
  imageSmoothingEnabled?: boolean;
  imageSmoothingQuality?: "low" | "medium" | "high";
  // 可选的 canvas 实例（浏览器环境使用 HTMLCanvasElement）
  canvas?: T;
}

export interface DrawCallCanvas<T extends HTMLCanvasElement | OffscreenCanvas | Canvas = HTMLCanvasElement> {
  readonly width: number;
  readonly height: number;
  readonly pixelRatio: number;
  readonly canvas: T;
  render(element: LayoutElement): LayoutNode;
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
export function createCanvas<T extends HTMLCanvasElement | OffscreenCanvas | Canvas = HTMLCanvasElement>(
  options: CanvasOptions<T>
): DrawCallCanvas<T> {
  const { width, height, pixelRatio = 1 } = options;

  const canvas = options.canvas ?? createRawCanvas(width * pixelRatio, height * pixelRatio);

  if (options.canvas) {
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    if ("style" in canvas && options.updateStyles !== false) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  }

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (!ctx) {
    throw new Error("Failed to get 2d context");
  }
  ctx.resetTransform();

  // 应用图像平滑选项
  if (options.imageSmoothingEnabled !== undefined) {
    ctx.imageSmoothingEnabled = options.imageSmoothingEnabled;
  }
  if (options.imageSmoothingQuality !== undefined) {
    ctx.imageSmoothingQuality = options.imageSmoothingQuality;
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
    canvas: canvas as T,

    render(element: LayoutElement): LayoutNode {
      const layoutTree = computeLayout(element, measureCtx, {
        minWidth: 0,
        maxWidth: width,
        minHeight: 0,
        maxHeight: height,
      });
      if (options.fitContent) {
        // 根据内容调整画布大小
        const contentWidth = layoutTree.layout.width;
        const contentHeight = layoutTree.layout.height;
        if (canvas.width !== contentWidth * pixelRatio || canvas.height !== contentHeight * pixelRatio) {
          canvas.width = contentWidth * pixelRatio;
          canvas.height = contentHeight * pixelRatio;
          if ("style" in canvas && options.updateStyles !== false) {
            canvas.style.width = `${contentWidth}px`;
            canvas.style.height = `${contentHeight}px`;
          }
          // 重新应用缩放
          if (pixelRatio !== 1) {
            ctx.scale(pixelRatio, pixelRatio);
          }
        }
      }
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
        // @ts-ignore
        return canvas.toDataURL(type, quality);
      }
      throw new Error("toDataURL not supported");
    },

    toBuffer(type: "image/png" | "image/jpeg" = "image/png"): Buffer {
      if ("toBuffer" in canvas && typeof canvas.toBuffer === "function") {
        // @ts-ignore
        return canvas.toBuffer(type);
      }
      throw new Error("toBuffer not supported in this environment");
    },
  };
}
