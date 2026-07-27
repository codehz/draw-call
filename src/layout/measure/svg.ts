import type { MeasureContext } from "@/layout/utils/measure";
import type { Element, SvgElement } from "@/types/components";

/**
 * 测量 SVG 元素的固有尺寸
 */
export function measureSvgSize(
  element: Element,
  _ctx: MeasureContext,
  _availableWidth: number
): { width: number; height: number } {
  const svgElement = element as SvgElement;

  // 如果指定了明确的宽高，则使用指定值
  if (svgElement.width !== undefined && svgElement.height !== undefined) {
    return {
      width: typeof svgElement.width === "number" ? svgElement.width : 0,
      height: typeof svgElement.height === "number" ? svgElement.height : 0,
    };
  }

  // 如果只指定了一个维度，尝试从 viewBox 推断另一个维度
  if (svgElement.viewBox) {
    const viewBoxWidth = svgElement.viewBox.width;
    const viewBoxHeight = svgElement.viewBox.height;
    const aspectRatio = viewBoxWidth / viewBoxHeight;

    if (svgElement.width !== undefined && typeof svgElement.width === "number") {
      return {
        width: svgElement.width,
        height: svgElement.width / aspectRatio,
      };
    }

    if (svgElement.height !== undefined && typeof svgElement.height === "number") {
      return {
        width: svgElement.height * aspectRatio,
        height: svgElement.height,
      };
    }

    // 如果都没指定，使用 viewBox 的尺寸
    return {
      width: viewBoxWidth,
      height: viewBoxHeight,
    };
  }

  // 默认返回0尺寸
  return { width: 0, height: 0 };
}
