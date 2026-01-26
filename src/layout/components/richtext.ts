import type { MeasureContext } from "@/layout/utils/measure";
import type { RichTextElement, RichTextSpan } from "@/types/components";
import type { RichTextLine, RichTextSpanSegment } from "@/types/layout";

/**
 * 测量富文本元素的固有尺寸
 */
export function measureRichTextSize(
  element: RichTextElement,
  ctx: MeasureContext,
  availableWidth: number
): { width: number; height: number } {
  const lineHeight = element.lineHeight ?? 1.2;
  const richLines = wrapRichText(ctx, element.spans, availableWidth, lineHeight);

  let maxWidth = 0;
  let totalHeight = 0;

  for (const line of richLines) {
    maxWidth = Math.max(maxWidth, line.width);
    totalHeight += line.height;
  }

  return {
    width: maxWidth,
    height: totalHeight,
  };
}

/**
 * 将富文本内容拆分为行
 */
export function wrapRichText(
  ctx: MeasureContext,
  spans: RichTextSpan[],
  maxWidth: number,
  lineHeightScale: number = 1.2
): RichTextLine[] {
  const lines: RichTextLine[] = [];
  let currentSegments: RichTextSpanSegment[] = [];
  let currentLineWidth = 0;

  const pushLine = () => {
    if (currentSegments.length === 0) return;

    let maxTopDist = 0;
    let maxBottomDist = 0;
    let maxLineHeight = 0;

    for (const seg of currentSegments) {
      const topDist = seg.ascent - seg.offset;
      const bottomDist = seg.descent + seg.offset;
      maxTopDist = Math.max(maxTopDist, topDist);
      maxBottomDist = Math.max(maxBottomDist, bottomDist);
      maxLineHeight = Math.max(maxLineHeight, seg.height);
    }

    const contentHeight = maxTopDist + maxBottomDist;
    const finalHeight = Math.max(contentHeight, maxLineHeight);

    // 如果 finalHeight > contentHeight，我们需要增加 baseline 偏移来保持垂直居中或者顶部对齐
    // 这里采用底部对齐或者增加均匀间距的方法。通常是增加 (finalHeight - contentHeight) / 2
    const extra = (finalHeight - contentHeight) / 2;

    lines.push({
      segments: [...currentSegments],
      width: currentLineWidth,
      height: finalHeight,
      baseline: maxTopDist + extra,
    });

    currentSegments = [];
    currentLineWidth = 0;
  };

  for (const span of spans) {
    const font = span.font ?? {};
    const fontSize = font.size ?? 16;
    const lh = fontSize * lineHeightScale;

    // 简单按照空格拆分，保留空格
    const words = span.text.split(/(\s+)/);

    for (const word of words) {
      if (word === "") continue;

      const metrics = ctx.measureText(word, font);
      const wordWidth = metrics.width;

      if (maxWidth > 0 && currentLineWidth + wordWidth > maxWidth && currentSegments.length > 0) {
        pushLine();
      }

      currentSegments.push({
        text: word,
        font: font,
        color: span.color,
        background: span.background,
        underline: span.underline,
        strikethrough: span.strikethrough,
        width: wordWidth,
        height: lh,
        ascent: metrics.ascent,
        descent: metrics.descent,
        offset: metrics.offset,
      });
      currentLineWidth += wordWidth;
    }
  }

  pushLine();

  if (lines.length === 0) {
    return [{ segments: [], width: 0, height: 0, baseline: 0 }];
  }

  return lines;
}
