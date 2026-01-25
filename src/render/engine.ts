import type { Color, Border, Shadow, FontProps } from "../types/base";
import { normalizeBorderRadius } from "../types/base";
import type { BoxElement, TextElement, StackElement } from "../types/components";
import type { LayoutNode } from "../layout/engine";
import { buildFontString } from "../layout/measure";

// 渲染上下文接口
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
}

// 绘制圆角矩形路径
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: [number, number, number, number]
): void {
  const [tl, tr, br, bl] = radius;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

// 应用阴影
function applyShadow(ctx: CanvasRenderingContext2D, shadow?: Shadow): void {
  if (shadow) {
    ctx.shadowOffsetX = shadow.offsetX ?? 0;
    ctx.shadowOffsetY = shadow.offsetY ?? 0;
    ctx.shadowBlur = shadow.blur ?? 0;
    ctx.shadowColor = (shadow.color as string) ?? "rgba(0,0,0,0.5)";
  } else {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  }
}

// 清除阴影
function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

// 绘制 Box 背景和边框
function renderBox(
  ctx: CanvasRenderingContext2D,
  node: LayoutNode
): void {
  const element = node.element as BoxElement | StackElement;
  const { x, y, width, height } = node.layout;

  const border = element.border;
  const radius = normalizeBorderRadius(border?.radius);
  const hasRadius = radius.some((r) => r > 0);

  // 设置透明度
  if (element.opacity !== undefined && element.opacity < 1) {
    ctx.globalAlpha = element.opacity;
  }

  // 绘制阴影（需要先绘制背景）
  if (element.shadow && element.background) {
    applyShadow(ctx, element.shadow);
  }

  // 绘制背景
  if (element.background) {
    ctx.fillStyle = element.background as string;
    if (hasRadius) {
      roundRectPath(ctx, x, y, width, height, radius);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, width, height);
    }
    clearShadow(ctx);
  }

  // 绘制边框
  if (border && border.width && border.width > 0) {
    ctx.strokeStyle = (border.color as string) ?? "#000";
    ctx.lineWidth = border.width;
    if (hasRadius) {
      roundRectPath(ctx, x, y, width, height, radius);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, width, height);
    }
  }

  // 恢复透明度
  if (element.opacity !== undefined && element.opacity < 1) {
    ctx.globalAlpha = 1;
  }
}

// 绘制文本
function renderText(
  ctx: CanvasRenderingContext2D,
  node: LayoutNode
): void {
  const element = node.element as TextElement;
  const { contentX, contentY, contentWidth, contentHeight } = node.layout;
  const lines = node.lines ?? [element.content];

  const font = element.font ?? {};
  const fontSize = font.size ?? 16;
  const lineHeight = element.lineHeight ?? 1.2;
  const lineHeightPx = fontSize * lineHeight;

  ctx.font = buildFontString(font);
  ctx.fillStyle = (element.color as string) ?? "#000";

  // 水平对齐
  let textAlign: CanvasTextAlign = "left";
  if (element.align === "center") textAlign = "center";
  else if (element.align === "right") textAlign = "right";
  ctx.textAlign = textAlign;

  // 垂直基线
  ctx.textBaseline = "top";

  // 计算文本块的总高度
  const totalTextHeight = lines.length * lineHeightPx;

  // 垂直对齐偏移
  let verticalOffset = 0;
  if (element.verticalAlign === "middle") {
    verticalOffset = (contentHeight - totalTextHeight) / 2;
  } else if (element.verticalAlign === "bottom") {
    verticalOffset = contentHeight - totalTextHeight;
  }

  // 水平位置
  let textX = contentX;
  if (element.align === "center") {
    textX = contentX + contentWidth / 2;
  } else if (element.align === "right") {
    textX = contentX + contentWidth;
  }

  // 应用阴影
  if (element.shadow) {
    applyShadow(ctx, element.shadow);
  }

  // 绘制每行文本
  for (let i = 0; i < lines.length; i++) {
    const lineY = contentY + verticalOffset + i * lineHeightPx;

    // 绘制描边
    if (element.stroke) {
      ctx.strokeStyle = element.stroke.color as string;
      ctx.lineWidth = element.stroke.width;
      ctx.strokeText(lines[i], textX, lineY);
    }

    // 绘制填充
    ctx.fillText(lines[i], textX, lineY);
  }

  // 清除阴影
  if (element.shadow) {
    clearShadow(ctx);
  }
}

// 渲染节点树
export function renderNode(
  ctx: CanvasRenderingContext2D,
  node: LayoutNode
): void {
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
      // TODO: 实现图片渲染
      break;
    }

    case "shape": {
      // TODO: 实现图形渲染
      break;
    }
  }
}
