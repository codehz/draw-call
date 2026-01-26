import { normalizeSpacing } from "../../types/base";
import type { Element, StackElement } from "../../types/components";
import type { MeasureContext } from "../utils/measure";

/**
 * 测量 Stack 元素的固有尺寸
 */
export function measureStackSize(
  element: StackElement,
  ctx: MeasureContext,
  availableWidth: number,
  measureChild: (el: Element, ctx: MeasureContext, width: number) => { width: number; height: number }
): { width: number; height: number } {
  const padding = normalizeSpacing(element.padding);

  let contentWidth = 0;
  let contentHeight = 0;

  const children = element.children ?? [];

  for (const child of children) {
    const childMargin = normalizeSpacing(child.margin);
    const childSize = measureChild(
      child,
      ctx,
      availableWidth - padding.left - padding.right - childMargin.left - childMargin.right
    );
    contentWidth = Math.max(contentWidth, childSize.width + childMargin.left + childMargin.right);
    contentHeight = Math.max(contentHeight, childSize.height + childMargin.top + childMargin.bottom);
  }

  // 如果明确设置了数值尺寸，优先使用
  const intrinsicWidth = contentWidth + padding.left + padding.right;
  const intrinsicHeight = contentHeight + padding.top + padding.bottom;

  return {
    width: typeof element.width === "number" ? element.width : intrinsicWidth,
    height: typeof element.height === "number" ? element.height : intrinsicHeight,
  };
}
