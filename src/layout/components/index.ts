import type { BoxElement, Element, StackElement } from "../../types/components";
import type { MeasureContext } from "../utils/measure";
import { measureBoxSize } from "./box";
import { measureImageSize } from "./image";
import { measureStackSize } from "./stack";
import { measureSvgSize } from "./svg";
import { measureTextSize } from "./text";

/**
 * 计算元素的固有尺寸（不依赖父容器的尺寸）
 */
export function measureIntrinsicSize(
  element: Element,
  ctx: MeasureContext,
  availableWidth: number
): { width: number; height: number } {
  switch (element.type) {
    case "text":
      return measureTextSize(element, ctx, availableWidth);
    case "box":
      return measureBoxSize(element as BoxElement, ctx, availableWidth, measureIntrinsicSize);
    case "stack":
      return measureStackSize(element as StackElement, ctx, availableWidth, measureIntrinsicSize);
    case "image":
      return measureImageSize(element, ctx, availableWidth);
    case "svg":
      return measureSvgSize(element, ctx, availableWidth);
    default:
      return { width: 0, height: 0 };
  }
}

export { measureBoxSize } from "./box";
export { measureImageSize } from "./image";
export { measureStackSize } from "./stack";
export { measureSvgSize } from "./svg";
export { measureTextSize } from "./text";
