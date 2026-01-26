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

      // 检查是否是纯空格
      const isWhitespace = /^\s+$/.test(word);

      if (isWhitespace) {
        // 空格直接处理
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
      } else {
        // 非空格文本，可能需要按字符拆分（用于中文）
        const metrics = ctx.measureText(word, font);
        const wordWidth = metrics.width;

        // 如果整个单词能放下，直接添加
        if (maxWidth <= 0 || currentLineWidth + wordWidth <= maxWidth) {
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
        } else {
          // 单词超出宽度，需要按字符拆分
          if (currentSegments.length > 0) {
            pushLine();
          }

          // 逐字符处理（支持中文）
          const remainingWidth = maxWidth;
          let currentPos = 0;

          while (currentPos < word.length) {
            // 尝试找到能放入当前行的最长子串
            let bestLen = 0;

            for (let len = word.length - currentPos; len > 0; len--) {
              const substr = word.substring(currentPos, currentPos + len);
              const m = ctx.measureText(substr, font);

              if (currentLineWidth + m.width <= remainingWidth) {
                bestLen = len;

                // 继续扩展看能否容纳更多
                if (len < word.length - currentPos) break;
              }
            }

            if (bestLen === 0) {
              // 即使是单个字符也放不下，强制断行
              if (currentSegments.length > 0) {
                pushLine();
              }
              // 重新尝试
              bestLen = 1;
            }

            const substr = word.substring(currentPos, currentPos + bestLen);
            const m = ctx.measureText(substr, font);

            currentSegments.push({
              text: substr,
              font: font,
              color: span.color,
              background: span.background,
              underline: span.underline,
              strikethrough: span.strikethrough,
              width: m.width,
              height: lh,
              ascent: m.ascent,
              descent: m.descent,
              offset: m.offset,
            });
            currentLineWidth += m.width;
            currentPos += bestLen;

            // 如果还有剩余文本且当前行已满，换行
            if (currentPos < word.length && currentLineWidth >= remainingWidth) {
              pushLine();
            }
          }
        }
      }
    }
  }

  pushLine();

  if (lines.length === 0) {
    return [{ segments: [], width: 0, height: 0, baseline: 0 }];
  }

  return lines;
}
