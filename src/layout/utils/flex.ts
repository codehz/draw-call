import type { NormalizedSpacing } from "@/types/base";
import type { JustifyContent } from "@/types/layout";

import { outerCrossSize, outerMainSize } from "./axis";

export interface FlexItemGeometry {
  width: number;
  height: number;
  margin: NormalizedSpacing;
  flex?: number;
}

/**
 * 按主轴可用尺寸将子项分组成多行/列。
 * 仅处理几何数据，不依赖 Canvas 或递归布局。
 */
export function groupFlexLines<T extends FlexItemGeometry>(
  items: T[],
  isRow: boolean,
  gap: number,
  mainAxisSize: number,
  wrap: boolean
): T[][] {
  if (!wrap) {
    return items.length > 0 ? [items] : [];
  }

  const lines: T[][] = [];
  let currentLine: T[] = [];
  let currentLineSize = 0;

  for (const item of items) {
    const itemSize = outerMainSize(isRow, item.width, item.height, item.margin);
    const needsWrap = currentLine.length > 0 && currentLineSize + gap + itemSize > mainAxisSize;

    if (needsWrap) {
      lines.push(currentLine);
      currentLine = [item];
      currentLineSize = itemSize;
    } else {
      currentLine.push(item);
      currentLineSize += (currentLine.length > 1 ? gap : 0) + itemSize;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * 模拟 wrap 后的内容主轴/交叉轴尺寸（用于固有尺寸测量）。
 */
export function measureWrappedContentSize(
  items: FlexItemGeometry[],
  isRow: boolean,
  gap: number,
  availableMain: number
): { width: number; height: number } {
  let currentMain = 0;
  let currentCross = 0;
  let totalCross = 0;
  let maxMain = 0;
  let lineCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemMain = outerMainSize(isRow, item.width, item.height, item.margin);
    const itemCross = outerCrossSize(isRow, item.width, item.height, item.margin);
    const needsWrap = lineCount > 0 && currentMain + gap + itemMain > availableMain;

    if (needsWrap) {
      totalCross += currentCross;
      maxMain = Math.max(maxMain, currentMain);
      lineCount++;
      currentMain = itemMain;
      currentCross = itemCross;
    } else {
      if (lineCount > 0 || i > 0) {
        currentMain += gap;
      }
      currentMain += itemMain;
      currentCross = Math.max(currentCross, itemCross);
      if (i === 0) lineCount = 1;
    }
  }

  if (items.length > 0) {
    totalCross += currentCross;
    maxMain = Math.max(maxMain, currentMain);
  }

  if (lineCount > 1) {
    totalCross += gap * (lineCount - 1);
  }

  return isRow ? { width: maxMain, height: totalCross } : { width: totalCross, height: maxMain };
}

export interface MainAxisPlacement {
  mainStart: number;
  mainGap: number;
}

/**
 * 根据 justify 计算主轴起点与项间距。
 */
export function resolveMainAxisPlacement(
  justify: JustifyContent,
  freeSpace: number,
  itemCount: number,
  gap: number
): MainAxisPlacement {
  let mainStart = 0;
  let mainGap = gap;

  switch (justify) {
    case "start":
      mainStart = 0;
      break;
    case "end":
      mainStart = freeSpace;
      break;
    case "center":
      mainStart = freeSpace / 2;
      break;
    case "space-between":
      mainStart = 0;
      if (itemCount > 1) {
        mainGap = gap + freeSpace / (itemCount - 1);
      }
      break;
    case "space-around":
      if (itemCount > 0) {
        const spacing = freeSpace / itemCount;
        mainStart = spacing / 2;
        mainGap = gap + spacing;
      }
      break;
    case "space-evenly":
      if (itemCount > 0) {
        const spacing = freeSpace / (itemCount + 1);
        mainStart = spacing;
        mainGap = gap + spacing;
      }
      break;
  }

  return { mainStart, mainGap };
}

export function lineMainSize(items: FlexItemGeometry[], isRow: boolean, gap: number): number {
  if (items.length === 0) return 0;
  const totalGap = items.length > 1 ? gap * (items.length - 1) : 0;
  return items.reduce((sum, item) => sum + outerMainSize(isRow, item.width, item.height, item.margin), 0) + totalGap;
}

export function lineCrossSize(items: FlexItemGeometry[], isRow: boolean): number {
  return items.reduce((max, item) => Math.max(max, outerCrossSize(isRow, item.width, item.height, item.margin)), 0);
}
