import type { LayoutNode } from "../../layout/engine";
import { normalizeBorderRadius } from "../../types/base";
import type { BoxElement, StackElement } from "../../types/components";
import { resolveColor } from "../utils/colors";
import { applyShadow, clearShadow } from "../utils/shadows";
import { roundRectPath } from "../utils/shapes";

// 绘制 Box 背景和边框
export function renderBox(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
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
    ctx.fillStyle = resolveColor(ctx, element.background, x, y, width, height);
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
    ctx.strokeStyle = border.color ? resolveColor(ctx, border.color, x, y, width, height) : "#000";
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
