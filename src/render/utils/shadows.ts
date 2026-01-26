import type { Shadow } from "@/types/base";

// 应用阴影
export function applyShadow(ctx: CanvasRenderingContext2D, shadow?: Shadow): void {
  if (shadow) {
    ctx.shadowOffsetX = shadow.offsetX ?? 0;
    ctx.shadowOffsetY = shadow.offsetY ?? 0;
    ctx.shadowBlur = shadow.blur ?? 0;
    ctx.shadowColor = (shadow.color as string) ?? "rgba(0,0,0,0.5)";
  } else {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  }
}

// 清除阴影
export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}
