import { normalizeSpacing } from "../../types/base";
import type { BoxElement, Element } from "../../types/components";
import type { MeasureContext } from "../utils/measure";

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
  const isRow = direction === "row" || direction === "row-reverse";

  let contentWidth = 0;
  let contentHeight = 0;

  const children = element.children ?? [];

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

  // 如果明确设置了数值尺寸，优先使用
  const intrinsicWidth = contentWidth + padding.left + padding.right;
  const intrinsicHeight = contentHeight + padding.top + padding.bottom;

  return {
    width: typeof element.width === "number" ? element.width : intrinsicWidth,
    height: typeof element.height === "number" ? element.height : intrinsicHeight,
  };
}
