import type { MeasureContext } from "@/layout/utils/measure";
import type { Element, ImageElement } from "@/types/components";

/**
 * 测量 Image 元素的固有尺寸
 */
export function measureImageSize(
  element: Element,
  _ctx: MeasureContext,
  _availableWidth: number
): { width: number; height: number } {
  const imageElement = element as ImageElement;

  // 如果指定了明确的宽高，则使用指定值
  if (imageElement.width !== undefined && imageElement.height !== undefined) {
    return {
      width: typeof imageElement.width === "number" ? imageElement.width : 0,
      height: typeof imageElement.height === "number" ? imageElement.height : 0,
    };
  }

  // 如果没有指定尺寸，尝试从图片源获取自然尺寸
  const src = imageElement.src;
  if (src) {
    const imgWidth = "naturalWidth" in src ? src.naturalWidth : "width" in src ? +src.width : 0;
    const imgHeight = "naturalHeight" in src ? src.naturalHeight : "height" in src ? +src.height : 0;

    // 如果图片有自然尺寸，返回自然尺寸
    if (imgWidth > 0 && imgHeight > 0) {
      return { width: imgWidth, height: imgHeight };
    }
  }

  // 默认返回0尺寸
  return { width: 0, height: 0 };
}
