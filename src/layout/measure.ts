import type { FontProps } from "../types/base";

// 测量上下文接口 - 抽象 Canvas 测量 API
export interface MeasureContext {
  measureText(text: string, font: FontProps): { width: number; height: number };
}

// 构建字体字符串
export function buildFontString(font: FontProps): string {
  const style = font.style ?? "normal";
  const weight = font.weight ?? "normal";
  const size = font.size ?? 16;
  const family = font.family ?? "sans-serif";
  return `${style} ${weight} ${size}px ${family}`;
}

// 创建基于 Canvas 的测量上下文
export function createCanvasMeasureContext(ctx: CanvasRenderingContext2D): MeasureContext {
  return {
    measureText(text: string, font: FontProps) {
      ctx.font = buildFontString(font);
      const metrics = ctx.measureText(text);
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      return {
        width: metrics.width,
        height: height || font.size || 16,
      };
    },
  };
}

// 文本换行
export function wrapText(ctx: MeasureContext, text: string, maxWidth: number, font: FontProps): string[] {
  if (maxWidth <= 0) {
    return [text];
  }

  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/(\s+)/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + word;
      const { width } = ctx.measureText(testLine, font);

      if (width > maxWidth && currentLine !== "") {
        lines.push(currentLine.trim());
        currentLine = word.trimStart();
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine.trim());
    }
  }

  return lines.length > 0 ? lines : [""];
}

// 截断文本
export function truncateText(
  ctx: MeasureContext,
  text: string,
  maxWidth: number,
  font: FontProps,
  ellipsis: string = "..."
): string {
  const { width } = ctx.measureText(text, font);
  if (width <= maxWidth) {
    return text;
  }

  const ellipsisWidth = ctx.measureText(ellipsis, font).width;
  const availableWidth = maxWidth - ellipsisWidth;

  if (availableWidth <= 0) {
    return ellipsis;
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

  return text.slice(0, left) + ellipsis;
}
