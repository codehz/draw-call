import type { MeasureContext } from "@/layout/utils/measure";
import type { Element } from "@/types/components";

/**
 * 测量 Image 元素的固有尺寸
 */
export function measureImageSize(
  _element: Element,
  _ctx: MeasureContext,
  _availableWidth: number
): { width: number; height: number } {
  // 图片使用指定尺寸或默认值
  return { width: 0, height: 0 };
}
