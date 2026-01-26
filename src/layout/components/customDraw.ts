import type { MeasureContext } from "@/layout/utils/measure";
import type { CustomDrawElement } from "@/types/components";
import type { MeasureFunction } from "@/types/layout";

/**
 * 测量 CustomDraw 元素的固有尺寸
 */
export function measureCustomDrawSize(
  element: CustomDrawElement,
  ctx: MeasureContext,
  availableWidth: number,
  measureChild?: MeasureFunction
): { width: number; height: number } {
  // 如果 width 和 height 都明确指定（不是 auto/fill/%），返回它们的值
  if (typeof element.width === "number" && typeof element.height === "number") {
    return {
      width: element.width,
      height: element.height,
    };
  }

  // 否则，如果有 children，调用 measureChild 获取子元素的固有尺寸
  if (element.children && measureChild) {
    return measureChild(element.children, ctx, availableWidth);
  }

  // 否则返回 { width: 0, height: 0 }
  return { width: 0, height: 0 };
}
