import { renderBox } from "@/render/components/box";
import { renderImage } from "@/render/components/image";
import { renderRichText } from "@/render/components/richtext";
import { renderSvg } from "@/render/components/svg";
import { renderText } from "@/render/components/text";
import { renderTransform } from "@/render/components/transform";
import { roundRectPath } from "@/render/utils/shapes";
import { normalizeBorderRadius } from "@/types/base";
import type { LayoutNode } from "@/types/layout";

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

    case "richtext": {
      renderRichText(ctx, node);
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

    case "transform": {
      renderTransform(ctx, node);
      break;
    }
  }
}
