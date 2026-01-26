import type { LayoutNode } from "@/layout/engine";
import { resolveColor } from "@/render/utils/colors";
import { applyShadow, clearShadow } from "@/render/utils/shadows";
import { roundRectPath } from "@/render/utils/shapes";
import { normalizeBorderRadius } from "@/types/base";
import type { ImageElement } from "@/types/components";

// 绘制图片
export function renderImage(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
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
