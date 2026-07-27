import type { ImageCrop } from "@/types/components";

/** 从图片源读取自然宽高 */
export function getImageNaturalSize(src: CanvasImageSource | ImageBitmap): {
  width: number;
  height: number;
} {
  const width = "naturalWidth" in src ? src.naturalWidth : "width" in src ? +src.width : 0;
  const height = "naturalHeight" in src ? src.naturalHeight : "height" in src ? +src.height : 0;
  return { width, height };
}

/**
 * 将 crop 钳制到原图范围内（按矩形边独立 clamp，取与原图的交集）。
 * 无效或无交集时返回 null。
 */
export function resolveCropRect(
  crop: ImageCrop,
  imgWidth: number,
  imgHeight: number
): { sx: number; sy: number; sw: number; sh: number } | null {
  if (imgWidth <= 0 || imgHeight <= 0) return null;

  const rawWidth = Math.max(crop.width, 0);
  const rawHeight = Math.max(crop.height, 0);
  if (rawWidth <= 0 || rawHeight <= 0) return null;

  const rawLeft = crop.x;
  const rawTop = crop.y;
  const rawRight = crop.x + rawWidth;
  const rawBottom = crop.y + rawHeight;

  const sx = Math.min(Math.max(rawLeft, 0), imgWidth);
  const sy = Math.min(Math.max(rawTop, 0), imgHeight);
  const right = Math.min(Math.max(rawRight, 0), imgWidth);
  const bottom = Math.min(Math.max(rawBottom, 0), imgHeight);

  const sw = right - sx;
  const sh = bottom - sy;

  if (sw <= 0 || sh <= 0) return null;

  return { sx, sy, sw, sh };
}
