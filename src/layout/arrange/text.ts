import type { MeasureContext } from "@/layout/utils/measure";
import { truncateText, wrapText } from "@/layout/utils/measure";
import type { TextElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";

/**
 * 为 Text 节点生成 lines / lineOffsets。
 */
export function arrangeText(node: LayoutNode, ctx: MeasureContext): void {
  const layoutElement = node.element as TextElement;
  const { contentWidth } = node.layout;
  const font = layoutElement.font ?? {};

  if (layoutElement.wrap && contentWidth > 0) {
    let { lines, offsets } = wrapText(ctx, layoutElement.content, contentWidth, font);
    if (layoutElement.maxLines && lines.length > layoutElement.maxLines) {
      lines = lines.slice(0, layoutElement.maxLines);
      offsets = offsets.slice(0, layoutElement.maxLines);
      if (layoutElement.ellipsis && lines.length > 0) {
        const lastIdx = lines.length - 1;
        const truncated = truncateText(ctx, lines[lastIdx], contentWidth, font);
        lines[lastIdx] = truncated.text;
        offsets[lastIdx] = truncated.offset;
      }
    }
    node.lines = lines;
    node.lineOffsets = offsets;
  } else {
    const { text, offset } = truncateText(
      ctx,
      layoutElement.content,
      contentWidth > 0 && layoutElement.ellipsis ? contentWidth : Infinity,
      font
    );
    node.lines = [text];
    node.lineOffsets = [offset];
  }
}
