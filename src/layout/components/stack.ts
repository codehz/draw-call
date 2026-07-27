import type { MeasureContext } from "@/layout/utils/measure";
import { getBorderWidth, normalizeSpacing } from "@/types/base";
import type { Element, StackElement } from "@/types/components";

/**
 * 安全获取元素的 margin
 * Transform 元素没有 margin，返回默认 spacing
 */
function getElementMargin(element: Element) {
  if (element.type === "transform") {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  return normalizeSpacing(element.margin);
}

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
  const borderWidth = getBorderWidth(element.border);

  let contentWidth = 0;
  let contentHeight = 0;

  const children = element.children ?? [];

  for (const child of children) {
    const childMargin = getElementMargin(child);
    const childSize = measureChild(
      child,
      ctx,
      availableWidth - borderWidth * 2 - padding.left - padding.right - childMargin.left - childMargin.right
    );
    contentWidth = Math.max(contentWidth, childSize.width + childMargin.left + childMargin.right);
    contentHeight = Math.max(contentHeight, childSize.height + childMargin.top + childMargin.bottom);
  }

  // 固有尺寸 = content + padding + border（border-box）
  const intrinsicWidth = contentWidth + padding.left + padding.right + borderWidth * 2;
  const intrinsicHeight = contentHeight + padding.top + padding.bottom + borderWidth * 2;

  return {
    width: typeof element.width === "number" ? element.width : intrinsicWidth,
    height: typeof element.height === "number" ? element.height : intrinsicHeight,
  };
}
