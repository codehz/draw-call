import type { MeasureContext } from "@/layout/utils/measure";
import { normalizeSpacing } from "@/types/base";
import type { BoxElement, Element } from "@/types/components";

/**
 * 测量 Box 元素的固有尺寸
 */
export function measureBoxSize(
  element: BoxElement,
  ctx: MeasureContext,
  availableWidth: number,
  measureChild: (el: Element, ctx: MeasureContext, width: number) => { width: number; height: number }
): { width: number; height: number } {
  const padding = normalizeSpacing(element.padding);
  const gap = element.gap ?? 0;
  const direction = element.direction ?? "row";
  const wrap = element.wrap ?? false;
  const isRow = direction === "row" || direction === "row-reverse";

  let contentWidth = 0;
  let contentHeight = 0;

  const children = element.children ?? [];

  // 如果启用了 wrap 且有固定宽度，需要模拟换行来计算正确的高度
  if (wrap && isRow && typeof element.width === "number") {
    // 计算内容区域的可用宽度
    const contentAvailableWidth = element.width - padding.left - padding.right;

    // 测量所有子元素
    const childSizes: Array<{
      width: number;
      height: number;
      margin: { left: number; right: number; top: number; bottom: number };
    }> = [];
    for (const child of children) {
      const childMargin = normalizeSpacing(child.margin);
      const childSize = measureChild(
        child,
        ctx,
        availableWidth - padding.left - padding.right - childMargin.left - childMargin.right
      );
      childSizes.push({
        width: childSize.width,
        height: childSize.height,
        margin: childMargin,
      });
    }

    // 模拟换行
    let currentLineWidth = 0;
    let currentLineHeight = 0;
    let totalHeight = 0;
    let maxWidth = 0;
    let lineCount = 0;

    for (let i = 0; i < childSizes.length; i++) {
      const { width, height, margin } = childSizes[i];
      const itemWidth = width + margin.left + margin.right;
      const itemHeight = height + margin.top + margin.bottom;

      // 检查是否需要换行
      const needsWrap = lineCount > 0 && currentLineWidth + gap + itemWidth > contentAvailableWidth;

      if (needsWrap) {
        // 完成当前行
        totalHeight += currentLineHeight;
        maxWidth = Math.max(maxWidth, currentLineWidth);
        lineCount++;

        // 开始新行
        currentLineWidth = itemWidth;
        currentLineHeight = itemHeight;
      } else {
        // 添加到当前行
        if (lineCount > 0 || i > 0) {
          currentLineWidth += gap;
        }
        currentLineWidth += itemWidth;
        currentLineHeight = Math.max(currentLineHeight, itemHeight);
        if (i === 0) lineCount = 1;
      }
    }

    // 添加最后一行
    if (childSizes.length > 0) {
      totalHeight += currentLineHeight;
      maxWidth = Math.max(maxWidth, currentLineWidth);
    }

    // 如果有多行，需要加上行间距
    if (lineCount > 1) {
      totalHeight += gap * (lineCount - 1);
    }

    contentWidth = maxWidth;
    contentHeight = totalHeight;
  } else if (wrap && !isRow && typeof element.height === "number") {
    // 列方向的换行
    const contentAvailableHeight = element.height - padding.top - padding.bottom;

    // 测量所有子元素
    const childSizes: Array<{
      width: number;
      height: number;
      margin: { left: number; right: number; top: number; bottom: number };
    }> = [];
    for (const child of children) {
      const childMargin = normalizeSpacing(child.margin);
      const childSize = measureChild(
        child,
        ctx,
        availableWidth - padding.left - padding.right - childMargin.left - childMargin.right
      );
      childSizes.push({
        width: childSize.width,
        height: childSize.height,
        margin: childMargin,
      });
    }

    // 模拟换列
    let currentColumnHeight = 0;
    let currentColumnWidth = 0;
    let totalWidth = 0;
    let maxHeight = 0;
    let columnCount = 0;

    for (let i = 0; i < childSizes.length; i++) {
      const { width, height, margin } = childSizes[i];
      const itemWidth = width + margin.left + margin.right;
      const itemHeight = height + margin.top + margin.bottom;

      // 检查是否需要换列
      const needsWrap = columnCount > 0 && currentColumnHeight + gap + itemHeight > contentAvailableHeight;

      if (needsWrap) {
        // 完成当前列
        totalWidth += currentColumnWidth;
        maxHeight = Math.max(maxHeight, currentColumnHeight);
        columnCount++;

        // 开始新列
        currentColumnHeight = itemHeight;
        currentColumnWidth = itemWidth;
      } else {
        // 添加到当前列
        if (columnCount > 0 || i > 0) {
          currentColumnHeight += gap;
        }
        currentColumnHeight += itemHeight;
        currentColumnWidth = Math.max(currentColumnWidth, itemWidth);
        if (i === 0) columnCount = 1;
      }
    }

    // 添加最后一列
    if (childSizes.length > 0) {
      totalWidth += currentColumnWidth;
      maxHeight = Math.max(maxHeight, currentColumnHeight);
    }

    // 如果有多列，需要加上列间距
    if (columnCount > 1) {
      totalWidth += gap * (columnCount - 1);
    }

    contentWidth = totalWidth;
    contentHeight = maxHeight;
  } else {
    // 不换行的情况，保持原有逻辑
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childMargin = normalizeSpacing(child.margin);
      const childSize = measureChild(
        child,
        ctx,
        availableWidth - padding.left - padding.right - childMargin.left - childMargin.right
      );

      if (isRow) {
        contentWidth += childSize.width + childMargin.left + childMargin.right;
        contentHeight = Math.max(contentHeight, childSize.height + childMargin.top + childMargin.bottom);
        if (i > 0) contentWidth += gap;
      } else {
        contentHeight += childSize.height + childMargin.top + childMargin.bottom;
        contentWidth = Math.max(contentWidth, childSize.width + childMargin.left + childMargin.right);
        if (i > 0) contentHeight += gap;
      }
    }
  }

  // 如果明确设置了数值尺寸，优先使用
  const intrinsicWidth = contentWidth + padding.left + padding.right;
  const intrinsicHeight = contentHeight + padding.top + padding.bottom;

  return {
    width: typeof element.width === "number" ? element.width : intrinsicWidth,
    height: typeof element.height === "number" ? element.height : intrinsicHeight,
  };
}
