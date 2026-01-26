import type { MeasureContext } from "@/layout/utils/measure";
import type { BoxElement, CustomDrawElement, Element, StackElement } from "@/types/components";
import { measureBoxSize } from "./box";
import { measureCustomDrawSize } from "./customDraw";
import { measureImageSize } from "./image";
import { measureRichTextSize } from "./richtext";
import { measureStackSize } from "./stack";
import { measureSvgSize } from "./svg";
import { measureTextSize } from "./text";
import { measureTransformSize } from "./transform";

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
    case "richtext":
      return measureRichTextSize(element, ctx, availableWidth);
    case "box":
      return measureBoxSize(element as BoxElement, ctx, availableWidth, measureIntrinsicSize);
    case "stack":
      return measureStackSize(element as StackElement, ctx, availableWidth, measureIntrinsicSize);
    case "image":
      return measureImageSize(element, ctx, availableWidth);
    case "svg":
      return measureSvgSize(element, ctx, availableWidth);
    case "transform":
      return measureTransformSize(element as Element, ctx, availableWidth, measureIntrinsicSize);
    case "customdraw":
      return measureCustomDrawSize(element as CustomDrawElement, ctx, availableWidth, measureIntrinsicSize);
    default:
      return { width: 0, height: 0 };
  }
}

export { measureBoxSize } from "./box";
export { measureCustomDrawSize } from "./customDraw";
export { measureImageSize } from "./image";
export { measureRichTextSize } from "./richtext";
export { measureStackSize } from "./stack";
export { measureSvgSize } from "./svg";
export { measureTextSize } from "./text";
export { measureTransformSize } from "./transform";
