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
      ctx.fillText(seg.text, lineX, baselineY - seg.offset);

      // 下划线：放在实际基线下方 2-3 像素
      if (seg.underline) {
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.moveTo(lineX, currentY + seg.height);
        ctx.lineTo(lineX + seg.width, currentY + seg.height);
        ctx.stroke();
      }

      // 删除线：放在文本中线位置
      if (seg.strikethrough) {
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        const strikeY = currentY + seg.height / 2 + seg.offset;
        ctx.moveTo(lineX, strikeY);
        ctx.lineTo(lineX + seg.width, strikeY);
        ctx.stroke();
      }

      ctx.restore();
      lineX += seg.width;
    }

    currentY += line.height;
  }
}
