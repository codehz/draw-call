import { wrapRichText } from "@/layout/measure/richtext";
import type { MeasureContext } from "@/layout/utils/measure";
import type { RichTextElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";

/**
 * 为 RichText 节点生成 richLines。
 */
export function arrangeRichText(node: LayoutNode, ctx: MeasureContext): void {
  const layoutElement = node.element as RichTextElement;
  const { contentWidth } = node.layout;
  const lineHeight = layoutElement.lineHeight ?? 1.2;
  const elementStyle = {
    font: layoutElement.font,
    color: layoutElement.color,
    background: layoutElement.background,
    underline: layoutElement.underline,
    strikethrough: layoutElement.strikethrough,
  };
  let lines = wrapRichText(ctx, layoutElement.spans, contentWidth, lineHeight, elementStyle);

  if (layoutElement.maxLines && lines.length > layoutElement.maxLines) {
    lines = lines.slice(0, layoutElement.maxLines);
    if (layoutElement.ellipsis && lines.length > 0) {
      // 富文本省略号保持简化处理：在最后一行最后一个 segment 后追加 ...
      const lastLine = lines[lines.length - 1];
      if (lastLine.segments.length > 0) {
        const lastSeg = lastLine.segments[lastLine.segments.length - 1];
        lastSeg.text += "...";
        const m = ctx.measureText(lastSeg.text, lastSeg.font ?? {});
        lastSeg.width = m.width;
        lastLine.width = lastLine.segments.reduce((sum, s) => sum + s.width, 0);
      }
    }
  }
  node.richLines = lines;
}
