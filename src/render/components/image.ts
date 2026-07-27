import { strokeInsetBorder } from "@/render/utils/border";
import { resolveColor } from "@/render/utils/colors";
import { applyShadow, clearShadow } from "@/render/utils/shadows";
import { roundRectPath } from "@/render/utils/shapes";
import { normalizeBorderRadius } from "@/types/base";
import type { ImageElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";
import { getImageNaturalSize, resolveCropRect } from "@/utils/imageSource";

// 绘制图片（图像绘入 content box；边框内缩绘制在 border-box 内）
export function renderImage(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as ImageElement;
  const { x, y, width, height, contentX, contentY, contentWidth, contentHeight } = node.layout;

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

  // 处理边框圆角裁剪（裁剪整个 border-box）
  const border = element.border;
  const radius = normalizeBorderRadius(border?.radius);
  const hasRadius = radius.some((r) => r > 0);

  if (hasRadius) {
    ctx.save();
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.clip();
  }

  // 获取图片尺寸与源矩形（crop 优先）
  const { width: imgWidth, height: imgHeight } = getImageNaturalSize(src);
  const cropRect = element.crop ? resolveCropRect(element.crop, imgWidth, imgHeight) : null;
  const sourceWidth = cropRect?.sw ?? imgWidth;
  const sourceHeight = cropRect?.sh ?? imgHeight;
  const canDraw = sourceWidth > 0 && sourceHeight > 0 && (!element.crop || cropRect !== null);

  // 计算绘制区域（基于 content box）
  const fit = element.fit ?? "fill";
  let drawX = contentX;
  let drawY = contentY;
  let drawWidth = contentWidth;
  let drawHeight = contentHeight;

  if (canDraw && fit !== "fill" && sourceWidth > 0 && sourceHeight > 0 && contentWidth > 0 && contentHeight > 0) {
    const imgAspect = sourceWidth / sourceHeight;
    const boxAspect = contentWidth / contentHeight;

    let scale = 1;

    switch (fit) {
      case "contain":
        // 图片完全显示在内容区内
        scale = imgAspect > boxAspect ? contentWidth / sourceWidth : contentHeight / sourceHeight;
        break;
      case "cover":
        // 图片覆盖整个内容区
        scale = imgAspect > boxAspect ? contentHeight / sourceHeight : contentWidth / sourceWidth;
        break;
      case "scale-down":
        // 类似 contain，但不放大
        scale = Math.min(1, imgAspect > boxAspect ? contentWidth / sourceWidth : contentHeight / sourceHeight);
        break;
      case "none":
        // 保持原始尺寸
        scale = 1;
        break;
    }

    drawWidth = sourceWidth * scale;
    drawHeight = sourceHeight * scale;

    // 计算位置
    const position = element.position ?? {};
    const posX = position.x ?? "center";
    const posY = position.y ?? "center";

    // 水平位置
    if (typeof posX === "number") {
      drawX = contentX + posX;
    } else {
      switch (posX) {
        case "left":
          drawX = contentX;
          break;
        case "center":
          drawX = contentX + (contentWidth - drawWidth) / 2;
          break;
        case "right":
          drawX = contentX + contentWidth - drawWidth;
          break;
      }
    }

    // 垂直位置
    if (typeof posY === "number") {
      drawY = contentY + posY;
    } else {
      switch (posY) {
        case "top":
          drawY = contentY;
          break;
        case "center":
          drawY = contentY + (contentHeight - drawHeight) / 2;
          break;
        case "bottom":
          drawY = contentY + contentHeight - drawHeight;
          break;
      }
    }
  }

  // 绘制图片（可临时覆盖 imageSmoothingEnabled，绘制后 restore）
  if (canDraw && contentWidth > 0 && contentHeight > 0) {
    const overrideSmoothing = element.imageSmoothingEnabled !== undefined;
    if (overrideSmoothing) {
      ctx.save();
      ctx.imageSmoothingEnabled = element.imageSmoothingEnabled!;
    }

    if (cropRect) {
      ctx.drawImage(src, cropRect.sx, cropRect.sy, cropRect.sw, cropRect.sh, drawX, drawY, drawWidth, drawHeight);
    } else {
      ctx.drawImage(src, drawX, drawY, drawWidth, drawHeight);
    }

    if (overrideSmoothing) {
      ctx.restore();
    }
  }

  // 清除阴影
  if (element.shadow) {
    clearShadow(ctx);
  }

  // 恢复裁剪
  if (hasRadius) {
    ctx.restore();
  }

  // 绘制边框（内缩，完全落在 border-box 内）
  if (border && border.width && border.width > 0) {
    ctx.strokeStyle = border.color ? resolveColor(ctx, border.color, x, y, width, height) : "#000";
    strokeInsetBorder(ctx, x, y, width, height, border.width, border.radius);
  }

  // 恢复透明度
  if (element.opacity !== undefined && element.opacity < 1) {
    ctx.globalAlpha = 1;
  }
}
