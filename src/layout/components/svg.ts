import type { MeasureContext } from "@/layout/utils/measure";
import type { Element } from "@/types/components";

/**
 * 测量 SVG 元素的固有尺寸
 */
export function measureSvgSize(
  _element: Element,
  _ctx: MeasureContext,
  _availableWidth: number
): { width: number; height: number } {
  return { width: 0, height: 0 };
}
