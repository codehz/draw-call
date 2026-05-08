import { buildFontString } from "@/render/utils/font";
import type { FontProps } from "@/types/base";

// 测量上下文接口 - 抽象 Canvas 测量 API
export interface MeasureTextResult {
  width: number;
  height: number;
  offset: number;
  ascent: number;
  descent: number;
}

export interface MeasureContext {
  measureText(text: string, font: FontProps): MeasureTextResult;
}

const MEASURE_CACHE_LIMIT = 256;

// 创建基于 Canvas 的测量上下文
export function createCanvasMeasureContext(ctx: CanvasRenderingContext2D): MeasureContext {
  const cache = new Map<string, MeasureTextResult>();
  let lastFontString: string | null = null;

  return {
    measureText(text: string, font: FontProps) {
      const fontString = buildFontString(font);
      const key = fontString + "\x00" + text;
      const hit = cache.get(key);
      if (hit !== undefined) {
        cache.delete(key);
        cache.set(key, hit);
        return hit;
      }
      if (fontString !== lastFontString) {
        ctx.font = fontString;
        ctx.textBaseline = "middle";
        lastFontString = fontString;
      }
      const metrics = ctx.measureText(text);
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const fontSize = font.size || 16;
      const result: MeasureTextResult = {
        width: metrics.width,
        height: height || fontSize,
        offset: (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2,
        ascent: metrics.actualBoundingBoxAscent,
        descent: metrics.actualBoundingBoxDescent,
      };
      if (cache.size >= MEASURE_CACHE_LIMIT) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
      cache.set(key, result);
      return result;
    },
  };
}

// 文本换行结果
export interface WrapTextResult {
  lines: string[];
  offsets: number[];
}

// 文本换行
export function wrapText(ctx: MeasureContext, text: string, maxWidth: number, font: FontProps): WrapTextResult {
  if (maxWidth <= 0) {
    const { offset } = ctx.measureText(text, font);
    return { lines: [text], offsets: [offset] };
  }

  const lines: string[] = [];
  const offsets: number[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      lines.push("");
      offsets.push(0);
      continue;
    }

    const words = paragraph.split(/(\s+)/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + word;
      const { width } = ctx.measureText(testLine, font);

      if (width > maxWidth && currentLine !== "") {
        const trimmed = currentLine.trim();
        lines.push(trimmed);
        offsets.push(ctx.measureText(trimmed, font).offset);
        currentLine = word.trimStart();
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      const trimmed = currentLine.trim();
      lines.push(trimmed);
      offsets.push(ctx.measureText(trimmed, font).offset);
    }
  }

  return lines.length > 0 ? { lines, offsets } : { lines: [""], offsets: [0] };
}

// 截断文本结果
export interface TruncateTextResult {
  text: string;
  offset: number;
}

// 截断文本
export function truncateText(
  ctx: MeasureContext,
  text: string,
  maxWidth: number,
  font: FontProps,
  ellipsis: string = "..."
): TruncateTextResult {
  const measured = ctx.measureText(text, font);
  if (measured.width <= maxWidth) {
    return { text, offset: measured.offset };
  }

  const ellipsisWidth = ctx.measureText(ellipsis, font).width;
  const availableWidth = maxWidth - ellipsisWidth;

  if (availableWidth <= 0) {
    const { offset } = ctx.measureText(ellipsis, font);
    return { text: ellipsis, offset };
  }

  let left = 0;
  let right = text.length;

  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2);
    const truncated = text.slice(0, mid);
    const { width: truncatedWidth } = ctx.measureText(truncated, font);

    if (truncatedWidth <= availableWidth) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }

  const result = text.slice(0, left) + ellipsis;
  const { offset } = ctx.measureText(result, font);
  return { text: result, offset };
}
