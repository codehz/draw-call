import { roundRectPath } from "@/render/utils/shapes";
import { normalizeBorderRadius } from "@/types/base";

/**
 * 在 border-box 内绘制边框（内缩描边）
 * Canvas stroke 以路径为中心，因此将路径内缩 borderWidth/2，使描边完全落在框内。
 * 圆角中心线半径使用 max(0, r - borderWidth/2)，使描边外缘贴合 border-box 圆角。
 */
export function strokeInsetBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  borderWidth: number,
  radius: number | [number, number, number, number] | undefined
): void {
  if (borderWidth <= 0 || width <= 0 || height <= 0) {
    return;
  }

  const inset = borderWidth / 2;
  const strokeWidth = Math.max(0, width - borderWidth);
  const strokeHeight = Math.max(0, height - borderWidth);
  if (strokeWidth <= 0 || strokeHeight <= 0) {
    return;
  }

  const outerRadius = normalizeBorderRadius(radius);
  const strokeRadius = outerRadius.map((r) => Math.max(0, r - inset)) as [number, number, number, number];
  const hasRadius = strokeRadius.some((r) => r > 0);

  ctx.lineWidth = borderWidth;
  if (hasRadius) {
    roundRectPath(ctx, x + inset, y + inset, strokeWidth, strokeHeight, strokeRadius);
    ctx.stroke();
  } else {
    ctx.strokeRect(x + inset, y + inset, strokeWidth, strokeHeight);
  }
}
