import type { MeasureContext } from "@/layout/utils/measure";
import type { Element, ImageElement } from "@/types/components";
import { getImageNaturalSize, resolveCropRect } from "@/utils/imageSource";

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

  const src = imageElement.src;
  if (src) {
    const { width: imgWidth, height: imgHeight } = getImageNaturalSize(src);

    // 有 crop 时使用钳制后的裁剪区域作为固有尺寸
    if (imageElement.crop && imgWidth > 0 && imgHeight > 0) {
      const rect = resolveCropRect(imageElement.crop, imgWidth, imgHeight);
      if (rect) {
        return { width: rect.sw, height: rect.sh };
      }
    }

    // 回退到图片自然尺寸
    if (imgWidth > 0 && imgHeight > 0) {
      return { width: imgWidth, height: imgHeight };
    }
  }

  // 默认返回0尺寸
  return { width: 0, height: 0 };
}
