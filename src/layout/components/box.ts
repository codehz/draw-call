import type { MeasureContext } from "@/layout/utils/measure";
import { normalizeSpacing } from "@/types/base";
import type { BoxElement, Element } from "@/types/components";

type ChildSize = {
  width: number;
  height: number;
  margin: { left: number; right: number; top: number; bottom: number };
};

function calcEffectiveSize(
  element: BoxElement,
  padding: { left: number; right: number; top: number; bottom: number },
  availableWidth: number
): { width: number; height: number } {
  const effectiveWidth =
    typeof element.width === "number"
      ? element.width - padding.left - padding.right
      : availableWidth > 0
        ? availableWidth
        : 0;
  const effectiveHeight = typeof element.height === "number" ? element.height - padding.top - padding.bottom : 0;
  return { width: effectiveWidth, height: effectiveHeight };
}

function collectChildSizes(
  children: Element[],
  ctx: MeasureContext,
  availableWidth: number,
  padding: { left: number; right: number; top: number; bottom: number },
  measureChild: (el: Element, ctx: MeasureContext, width: number) => { width: number; height: number }
): ChildSize[] {
  const childSizes: ChildSize[] = [];
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
  return childSizes;
}

function measureWrappedContent(
  childSizes: ChildSize[],
  gap: number,
  availableMain: number,
  isRow: boolean
): { width: number; height: number } {
  let currentMain = 0;
  let currentCross = 0;
  let totalCross = 0;
  let maxMain = 0;
  let lineCount = 0;

  for (let i = 0; i < childSizes.length; i++) {
    const { width, height, margin } = childSizes[i];
    const itemMain = isRow ? width + margin.left + margin.right : height + margin.top + margin.bottom;
    const itemCross = isRow ? height + margin.top + margin.bottom : width + margin.left + margin.right;

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

  if (childSizes.length > 0) {
    totalCross += currentCross;
    maxMain = Math.max(maxMain, currentMain);
  }

  if (lineCount > 1) {
    totalCross += gap * (lineCount - 1);
  }

  return isRow ? { width: maxMain, height: totalCross } : { width: totalCross, height: maxMain };
}

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

  // 计算可用于换行计算的宽度/高度
  // element.width/height 是总尺寸（包含 padding）
  const { width: effectiveWidth, height: effectiveHeight } = calcEffectiveSize(element, padding, availableWidth);

  // 如果启用了 wrap 且有可用宽度，需要模拟换行来计算正确的高度
  if (wrap && isRow && effectiveWidth > 0) {
    const childSizes = collectChildSizes(children, ctx, availableWidth, padding, measureChild);
    const wrapped = measureWrappedContent(childSizes, gap, effectiveWidth, true);
    contentWidth = wrapped.width;
    contentHeight = wrapped.height;
  } else if (wrap && !isRow && effectiveHeight > 0) {
    const childSizes = collectChildSizes(children, ctx, availableWidth, padding, measureChild);
    const wrapped = measureWrappedContent(childSizes, gap, effectiveHeight, false);
    contentWidth = wrapped.width;
    contentHeight = wrapped.height;
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
