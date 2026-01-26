import type { Color, GradientDescriptor } from "../../types/base";

// 判断是否为渐变描述符
export function isGradientDescriptor(color: Color): color is GradientDescriptor {
  return (
    typeof color === "object" &&
    color !== null &&
    "type" in color &&
    (color.type === "linear-gradient" || color.type === "radial-gradient")
  );
}

// 将渐变描述符解析为 CanvasGradient
export function resolveGradient(
  ctx: CanvasRenderingContext2D,
  descriptor: GradientDescriptor,
  x: number,
  y: number,
  width: number,
  height: number
): CanvasGradient {
  if (descriptor.type === "linear-gradient") {
    // 计算线性渐变的起点和终点
    // 角度 0deg 表示从下到上，90deg 表示从左到右
    const angleRad = ((descriptor.angle - 90) * Math.PI) / 180;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // 计算渐变线的长度（确保覆盖整个矩形）
    const diagLength = Math.sqrt(width * width + height * height) / 2;

    const x0 = centerX - Math.cos(angleRad) * diagLength;
    const y0 = centerY - Math.sin(angleRad) * diagLength;
    const x1 = centerX + Math.cos(angleRad) * diagLength;
    const y1 = centerY + Math.sin(angleRad) * diagLength;

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const stop of descriptor.stops) {
      gradient.addColorStop(stop.offset, stop.color);
    }
    return gradient;
  } else {
    // 径向渐变
    const diagLength = Math.sqrt(width * width + height * height);
    const startX = x + (descriptor.startX ?? 0.5) * width;
    const startY = y + (descriptor.startY ?? 0.5) * height;
    const startRadius = (descriptor.startRadius ?? 0) * diagLength;
    const endX = x + (descriptor.endX ?? 0.5) * width;
    const endY = y + (descriptor.endY ?? 0.5) * height;
    const endRadius = (descriptor.endRadius ?? 0.5) * diagLength;

    const gradient = ctx.createRadialGradient(startX, startY, startRadius, endX, endY, endRadius);
    for (const stop of descriptor.stops) {
      gradient.addColorStop(stop.offset, stop.color);
    }
    return gradient;
  }
}

// 解析颜色值（可能是渐变描述符）
export function resolveColor(
  ctx: CanvasRenderingContext2D,
  color: Color,
  x: number,
  y: number,
  width: number,
  height: number
): string | CanvasGradient | CanvasPattern {
  if (isGradientDescriptor(color)) {
    return resolveGradient(ctx, color, x, y, width, height);
  }
  return color as string | CanvasGradient | CanvasPattern;
}
