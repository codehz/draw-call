import type { MeasureContext } from "@/layout/utils/measure";
import { getBorderWidth, normalizeSpacing } from "@/types/base";
import type { Element, ImageElement } from "@/types/components";
import { getImageNaturalSize, resolveCropRect } from "@/utils/imageSource";

/**
 * 测量 Image 元素的固有尺寸（border-box：含 border 与 padding）
 */
export function measureImageSize(
  element: Element,
  _ctx: MeasureContext,
  _availableWidth: number
): { width: number; height: number } {
  const imageElement = element as ImageElement;
  const borderWidth = getBorderWidth(imageElement.border);
  const padding = normalizeSpacing(imageElement.padding);
  const chromeX = borderWidth * 2 + padding.left + padding.right;
  const chromeY = borderWidth * 2 + padding.top + padding.bottom;

  // 如果指定了明确的宽高，则使用指定值（数值视为 border-box）
  if (imageElement.width !== undefined && imageElement.height !== undefined) {
    return {
      width: typeof imageElement.width === "number" ? imageElement.width : 0,
      height: typeof imageElement.height === "number" ? imageElement.height : 0,
    };
  }

  const src = imageElement.src;
  if (src) {
    const { width: imgWidth, height: imgHeight } = getImageNaturalSize(src);

    // 有 crop 时使用钳制后的裁剪区域作为内容固有尺寸
    if (imageElement.crop && imgWidth > 0 && imgHeight > 0) {
      const rect = resolveCropRect(imageElement.crop, imgWidth, imgHeight);
      if (rect) {
        return { width: rect.sw + chromeX, height: rect.sh + chromeY };
      }
    }

    // 回退到图片自然尺寸 + border/padding
    if (imgWidth > 0 && imgHeight > 0) {
      return { width: imgWidth + chromeX, height: imgHeight + chromeY };
    }
  }

  // 默认返回 chrome 尺寸（无内容时仍占用 border/padding）
  return { width: chromeX, height: chromeY };
}
