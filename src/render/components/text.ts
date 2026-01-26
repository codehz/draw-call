import type { LayoutNode } from "../../layout/engine";
import type { TextElement } from "../../types/components";
import { resolveColor } from "../utils/colors";
import { buildFontString } from "../utils/font";
import { applyShadow, clearShadow } from "../utils/shadows";

// 绘制文本
export function renderText(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as TextElement;
  const { contentX, contentY, contentWidth, contentHeight } = node.layout;
  const lines = node.lines ?? [element.content];

  const font = element.font ?? {};
  const fontSize = font.size ?? 16;
  const lineHeight = element.lineHeight ?? 1.2;
  const lineHeightPx = fontSize * lineHeight;

  ctx.font = buildFontString(font);
  ctx.fillStyle = element.color
    ? resolveColor(ctx, element.color, contentX, contentY, contentWidth, contentHeight)
    : "#000";

  // 水平对齐
  let textAlign: CanvasTextAlign = "left";
  if (element.align === "center") textAlign = "center";
  else if (element.align === "right") textAlign = "right";
  ctx.textAlign = textAlign;

  // 垂直基线 - 使用 middle 以获得更准确的垂直对齐
  ctx.textBaseline = "middle";

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
    // 使用 middle 基线时，y 坐标应该是行的中心位置
    const lineY = contentY + verticalOffset + i * lineHeightPx + lineHeightPx / 2;

    // 使用布局阶段计算的基线偏移量修正 middle 基线的偏差
    // Canvas 的 middle 基线可能不准确，使用实际度量值进行修正
    const middleBaselineOffset = node.lineOffsets?.[i] ?? 0;
    const correctedLineY = lineY + middleBaselineOffset;

    // 绘制描边
    if (element.stroke) {
      ctx.strokeStyle = resolveColor(ctx, element.stroke.color, contentX, contentY, contentWidth, contentHeight);
      ctx.lineWidth = element.stroke.width;
      ctx.strokeText(lines[i], textX, correctedLineY);
    }

    // 绘制填充
    ctx.fillText(lines[i], textX, correctedLineY);
  }

  // 清除阴影
  if (element.shadow) {
    clearShadow(ctx);
  }
}
