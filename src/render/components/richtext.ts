import { resolveColor } from "@/render/utils/colors";
import { buildFontString } from "@/render/utils/font";
import type { RichTextElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";

export function renderRichText(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as RichTextElement;
  const { contentX, contentY, contentWidth, contentHeight } = node.layout;
  const lines = node.richLines ?? [];

  if (lines.length === 0) return;

  // 计算文本块的总高度
  const totalTextHeight = lines.reduce((sum, line) => sum + line.height, 0);

  // 垂直对齐偏移
  let verticalOffset = 0;
  if (element.verticalAlign === "middle") {
    verticalOffset = (contentHeight - totalTextHeight) / 2;
  } else if (element.verticalAlign === "bottom") {
    verticalOffset = contentHeight - totalTextHeight;
  }

  let currentY = contentY + verticalOffset;

  for (const line of lines) {
    // 水平对齐偏移
    let lineX = contentX;
    if (element.align === "center") {
      lineX = contentX + (contentWidth - line.width) / 2;
    } else if (element.align === "right") {
      lineX = contentX + (contentWidth - line.width);
    }

    const baselineY = currentY + line.baseline;

    for (const seg of line.segments) {
      ctx.save();

      const font = seg.font ?? {};
      ctx.font = buildFontString(font);

      // 绘制背景
      if (seg.background) {
        ctx.fillStyle = resolveColor(ctx, seg.background, lineX, currentY, seg.width, line.height);
        ctx.fillRect(lineX, currentY, seg.width, line.height);
      }

      // 绘制文本
      ctx.fillStyle = seg.color
        ? resolveColor(ctx, seg.color, lineX, currentY, seg.width, line.height)
        : element.color
          ? resolveColor(ctx, element.color, contentX, contentY, contentWidth, contentHeight)
          : "#000";

      ctx.textBaseline = "middle";
      // Canvas middle 基线可能不准，我们计算 middlePos
      // metrics.ascent - metrics.descent) / 2 是 textOffset
      // 我们用 baselineY 作为实际基线
      // ctx.fillText(seg.text, lineX, baselineY - textOffset)

      // 简单起见，这里直接用 middle 绘制，
      // 但为了对齐，我们需要计算每段文本在行内的垂直位置
      // segment.ascent 是从 middle 到顶部的距离
      // baseline 是从此行顶部到基线的距离

      ctx.fillText(seg.text, lineX, baselineY - seg.offset);

      // 下划线
      if (seg.underline) {
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.moveTo(lineX, baselineY + 2);
        ctx.lineTo(lineX + seg.width, baselineY + 2);
        ctx.stroke();
      }

      // 删除线
      if (seg.strikethrough) {
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.moveTo(lineX, baselineY - (font.size ?? 16) * 0.3);
        ctx.lineTo(lineX + seg.width, baselineY - (font.size ?? 16) * 0.3);
        ctx.stroke();
      }

      ctx.restore();
      lineX += seg.width;
    }

    currentY += line.height;
  }
}
