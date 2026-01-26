import type { LayoutNode } from "../layout";
import { normalizeBorderRadius } from "../types/base";
import { renderBox } from "./components/box";
import { renderImage } from "./components/image";
import { renderSvg } from "./components/svg";
import { renderText } from "./components/text";
import { roundRectPath } from "./utils/shapes";

// 渲染上下文接口
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
}

// 渲染节点树
export function renderNode(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element;

  switch (element.type) {
    case "box":
    case "stack": {
      renderBox(ctx, node);

      // 如果需要裁剪
      const shouldClip = element.clip === true;
      if (shouldClip) {
        ctx.save();
        const { x, y, width, height } = node.layout;
        const radius = normalizeBorderRadius(element.border?.radius);
        roundRectPath(ctx, x, y, width, height, radius);
        ctx.clip();
      }

      // 渲染子元素
      for (const child of node.children) {
        renderNode(ctx, child);
      }

      if (shouldClip) {
        ctx.restore();
      }
      break;
    }

    case "text": {
      renderText(ctx, node);
      break;
    }

    case "image": {
      renderImage(ctx, node);
      break;
    }

    case "svg": {
      renderSvg(ctx, node);
      break;
    }
  }
}
