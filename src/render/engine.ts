import type { LayoutNode } from "../layout/engine";
import { buildFontString } from "../layout/measure";
import type { Color, GradientDescriptor, Shadow } from "../types/base";
import { normalizeBorderRadius } from "../types/base";
import type { BoxElement, ImageElement, StackElement, TextElement } from "../types/components";
import { renderSvg } from "./svg";

// 判断是否为渐变描述符
function isGradientDescriptor(color: Color): color is GradientDescriptor {
  return (
    typeof color === "object" &&
    color !== null &&
    "type" in color &&
    (color.type === "linear-gradient" || color.type === "radial-gradient")
  );
}

// 将渐变描述符解析为 CanvasGradient
function resolveGradient(
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
function resolveColor(
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

// 渲染上下文接口
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
}

// 绘制圆角矩形路径
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: [number, number, number, number]
): void {
  const [tl, tr, br, bl] = radius;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

// 应用阴影
function applyShadow(ctx: CanvasRenderingContext2D, shadow?: Shadow): void {
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
function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

// 绘制 Box 背景和边框
function renderBox(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as BoxElement | StackElement;
  const { x, y, width, height } = node.layout;

  const border = element.border;
  const radius = normalizeBorderRadius(border?.radius);
  const hasRadius = radius.some((r) => r > 0);

  // 设置透明度
  if (element.opacity !== undefined && element.opacity < 1) {
    ctx.globalAlpha = element.opacity;
  }

  // 绘制阴影（需要先绘制背景）
  if (element.shadow && element.background) {
    applyShadow(ctx, element.shadow);
  }

  // 绘制背景
  if (element.background) {
    ctx.fillStyle = resolveColor(ctx, element.background, x, y, width, height);
    if (hasRadius) {
      roundRectPath(ctx, x, y, width, height, radius);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, width, height);
    }
    clearShadow(ctx);
  }

  // 绘制边框
  if (border && border.width && border.width > 0) {
    ctx.strokeStyle = border.color ? resolveColor(ctx, border.color, x, y, width, height) : "#000";
    ctx.lineWidth = border.width;
    if (hasRadius) {
      roundRectPath(ctx, x, y, width, height, radius);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, width, height);
    }
  }

  // 恢复透明度
  if (element.opacity !== undefined && element.opacity < 1) {
    ctx.globalAlpha = 1;
  }
}

// 绘制图片
function renderImage(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as ImageElement;
  const { x, y, width, height } = node.layout;

  // 获取图片源
  const src = element.src;
  if (!src) return;

  // 设置透明度
  if (element.opacity !== undefined && element.opacity < 1) {
    ctx.globalAlpha = element.opacity;
  }

  // 应用阴影
  if (element.shadow) {
    applyShadow(ctx, element.shadow);
  }

  // 处理边框圆角裁剪
  const border = element.border;
  const radius = normalizeBorderRadius(border?.radius);
  const hasRadius = radius.some((r) => r > 0);

  if (hasRadius) {
    ctx.save();
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.clip();
  }

  // 获取图片尺寸
  let imgWidth: number;
  let imgHeight: number;

  if (src instanceof ImageBitmap) {
    imgWidth = src.width;
    imgHeight = src.height;
  } else {
    // CanvasImageSource (HTMLImageElement, HTMLCanvasElement, etc.)
    const imgSrc = src as HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
    imgWidth = "naturalWidth" in imgSrc ? imgSrc.naturalWidth : imgSrc.width;
    imgHeight = "naturalHeight" in imgSrc ? imgSrc.naturalHeight : imgSrc.height;
  }

  // 计算绘制区域
  const fit = element.fit ?? "fill";
  let drawX = x;
  let drawY = y;
  let drawWidth = width;
  let drawHeight = height;

  if (fit !== "fill" && imgWidth > 0 && imgHeight > 0) {
    const imgAspect = imgWidth / imgHeight;
    const boxAspect = width / height;

    let scale = 1;

    switch (fit) {
      case "contain":
        // 图片完全显示在容器内
        scale = imgAspect > boxAspect ? width / imgWidth : height / imgHeight;
        break;
      case "cover":
        // 图片覆盖整个容器
        scale = imgAspect > boxAspect ? height / imgHeight : width / imgWidth;
        break;
      case "scale-down":
        // 类似 contain，但不放大
        scale = Math.min(1, imgAspect > boxAspect ? width / imgWidth : height / imgHeight);
        break;
      case "none":
        // 保持原始尺寸
        scale = 1;
        break;
    }

    drawWidth = imgWidth * scale;
    drawHeight = imgHeight * scale;

    // 计算位置
    const position = element.position ?? {};
    const posX = position.x ?? "center";
    const posY = position.y ?? "center";

    // 水平位置
    if (typeof posX === "number") {
      drawX = x + posX;
    } else {
      switch (posX) {
        case "left":
          drawX = x;
          break;
        case "center":
          drawX = x + (width - drawWidth) / 2;
          break;
        case "right":
          drawX = x + width - drawWidth;
          break;
      }
    }

    // 垂直位置
    if (typeof posY === "number") {
      drawY = y + posY;
    } else {
      switch (posY) {
        case "top":
          drawY = y;
          break;
        case "center":
          drawY = y + (height - drawHeight) / 2;
          break;
        case "bottom":
          drawY = y + height - drawHeight;
          break;
      }
    }
  }

  // 绘制图片
  ctx.drawImage(src, drawX, drawY, drawWidth, drawHeight);

  // 清除阴影
  if (element.shadow) {
    clearShadow(ctx);
  }

  // 恢复裁剪
  if (hasRadius) {
    ctx.restore();
  }

  // 绘制边框
  if (border && border.width && border.width > 0) {
    ctx.strokeStyle = border.color ? resolveColor(ctx, border.color, x, y, width, height) : "#000";
    ctx.lineWidth = border.width;
    if (hasRadius) {
      roundRectPath(ctx, x, y, width, height, radius);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, width, height);
    }
  }

  // 恢复透明度
  if (element.opacity !== undefined && element.opacity < 1) {
    ctx.globalAlpha = 1;
  }
}

// 绘制文本
function renderText(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as TextElement;
  const { contentX, contentY, contentWidth, contentHeight } = node.layout;
  const lines = node.lines ?? [element.content];

  const font = element.font ?? {};
  const fontSize = font.size ?? 16;
  const lineHeight = element.lineHeight ?? 1.2;
  const lineHeightPx = fontSize * lineHeight;

  ctx.font = buildFontString(font);
  ctx.fillStyle = element.color
    ? resolveColor(ctx, element.color, contentX, contentY, contentWidth, contentHeight)
    : "#000";

  // 水平对齐
  let textAlign: CanvasTextAlign = "left";
  if (element.align === "center") textAlign = "center";
  else if (element.align === "right") textAlign = "right";
  ctx.textAlign = textAlign;

  // 垂直基线 - 使用 middle 以获得更准确的垂直对齐
  ctx.textBaseline = "middle";

  // 计算文本块的总高度
  const totalTextHeight = lines.length * lineHeightPx;

  // 垂直对齐偏移
  let verticalOffset = 0;
  if (element.verticalAlign === "middle") {
    verticalOffset = (contentHeight - totalTextHeight) / 2;
  } else if (element.verticalAlign === "bottom") {
    verticalOffset = contentHeight - totalTextHeight;
  }

  // 水平位置
  let textX = contentX;
  if (element.align === "center") {
    textX = contentX + contentWidth / 2;
  } else if (element.align === "right") {
    textX = contentX + contentWidth;
  }

  // 应用阴影
  if (element.shadow) {
    applyShadow(ctx, element.shadow);
  }

  // 绘制每行文本
  for (let i = 0; i < lines.length; i++) {
    // 使用 middle 基线时，y 坐标应该是行的中心位置
    const lineY = contentY + verticalOffset + i * lineHeightPx + lineHeightPx / 2;

    // 使用布局阶段计算的基线偏移量修正 middle 基线的偏差
    // Canvas 的 middle 基线可能不准确，使用实际度量值进行修正
    const middleBaselineOffset = node.lineOffsets?.[i] ?? 0;
    const correctedLineY = lineY + middleBaselineOffset;

    // 绘制描边
    if (element.stroke) {
      ctx.strokeStyle = resolveColor(ctx, element.stroke.color, contentX, contentY, contentWidth, contentHeight);
      ctx.lineWidth = element.stroke.width;
      ctx.strokeText(lines[i], textX, correctedLineY);
    }

    // 绘制填充
    ctx.fillText(lines[i], textX, correctedLineY);
  }

  // 清除阴影
  if (element.shadow) {
    clearShadow(ctx);
  }
}

// 渲染节点树
export function renderNode(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element;

  switch (element.type) {
    case "box":
    case "stack": {
      renderBox(ctx, node);

      // 如果需要裁剪
      const shouldClip = element.clip === true;
      if (shouldClip) {
        ctx.save();
        const { x, y, width, height } = node.layout;
        const radius = normalizeBorderRadius(element.border?.radius);
        roundRectPath(ctx, x, y, width, height, radius);
        ctx.clip();
      }

      // 渲染子元素
      for (const child of node.children) {
        renderNode(ctx, child);
      }

      if (shouldClip) {
        ctx.restore();
      }
      break;
    }

    case "text": {
      renderText(ctx, node);
      break;
    }

    case "image": {
      renderImage(ctx, node);
      break;
    }

    case "svg": {
      renderSvg(ctx, node);
      break;
    }
  }
}
