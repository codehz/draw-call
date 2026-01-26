import type { TextElement } from "../../types/components";
import type { MeasureContext } from "../measure";
import { wrapText } from "../measure";

/**
 * 测量文本元素的固有尺寸
 */
export function measureTextSize(
  element: TextElement,
  ctx: MeasureContext,
  availableWidth: number
): { width: number; height: number } {
  const font = element.font ?? {};
  const fontSize = font.size ?? 16;
  const lineHeight = element.lineHeight ?? 1.2;
  const lineHeightPx = fontSize * lineHeight;

  // 如果设置了 wrap 且有可用宽度，进行换行计算
  if (element.wrap && availableWidth > 0 && availableWidth < Infinity) {
    const { lines } = wrapText(ctx, element.content, availableWidth, font);
    const { width: maxLineWidth } = lines.reduce(
      (max, line) => {
        const { width } = ctx.measureText(line, font);
        return width > max.width ? { width } : max;
      },
      { width: 0 }
    );
    return {
      width: maxLineWidth,
      height: lines.length * lineHeightPx,
    };
  }

  // 不换行时测量整行
  const { width, height } = ctx.measureText(element.content, font);
  return { width, height: Math.max(height, lineHeightPx) };
}
