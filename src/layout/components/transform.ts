import type { MeasureContext } from "@/layout/utils/measure";
import type { TransformElement } from "@/types/components";
import type { MeasureFunction } from "@/types/layout";

/**
 * 测量 Transform 元素的固有尺寸
 * Transform 不施加任何尺寸约束，直接透传子元素的测量结果
 * 变换（rotate, scale 等）仅在渲染时应用，不影响固有尺寸
 */
export function measureTransformSize(
  element: TransformElement,
  ctx: MeasureContext,
  availableWidth: number,
  measureIntrinsicSize: MeasureFunction
): { width: number; height: number } {
  // 直接测量子元素尺寸
  return measureIntrinsicSize(element.children, ctx, availableWidth);
}
