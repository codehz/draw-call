import { DOMMatrix } from "@/compat/DOMMatrix";
import { Path2D } from "@/compat/Path2D";
import { buildFontString } from "@/render/utils/font";
import type { Color, GradientDescriptor, StrokeProps } from "@/types/base";
import type {
  SvgAlign,
  SvgChild,
  SvgCircleChild,
  SvgElement,
  SvgEllipseChild,
  SvgGroupChild,
  SvgLineChild,
  SvgPathChild,
  SvgPolygonChild,
  SvgPolylineChild,
  SvgRectChild,
  SvgStyleProps,
  SvgTextChild,
  SvgTransformProps,
} from "@/types/components";
import type { LayoutNode } from "@/types/layout";

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
    const angleRad = ((descriptor.angle - 90) * Math.PI) / 180;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
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

// 解析颜色值
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

// 应用变换到矩阵
function applyTransform(base: DOMMatrix, transform?: SvgTransformProps["transform"]): DOMMatrix {
  if (!transform) return base;

  let result = new DOMMatrix([base.a, base.b, base.c, base.d, base.e, base.f]);

  if (transform.matrix) {
    const [a, b, c, d, e, f] = transform.matrix;
    result = result.multiply(new DOMMatrix([a, b, c, d, e, f]));
  }

  if (transform.translate) {
    result = result.translate(transform.translate[0], transform.translate[1]);
  }

  if (transform.rotate !== undefined) {
    if (typeof transform.rotate === "number") {
      result = result.rotate(transform.rotate);
    } else {
      const [angle, cx, cy] = transform.rotate;
      result = result.translate(cx, cy).rotate(angle).translate(-cx, -cy);
    }
  }

  if (transform.scale !== undefined) {
    if (typeof transform.scale === "number") {
      result = result.scale(transform.scale);
    } else {
      result = result.scale(transform.scale[0], transform.scale[1]);
    }
  }

  if (transform.skewX !== undefined) {
    // 弧度转换为度数
    const degrees = (transform.skewX * 180) / Math.PI;
    result = result.skewX(degrees);
  }

  if (transform.skewY !== undefined) {
    // 弧度转换为度数
    const degrees = (transform.skewY * 180) / Math.PI;
    result = result.skewY(degrees);
  }

  return result;
}

type Bounds = { x: number; y: number; width: number; height: number };

function applyStroke(ctx: CanvasRenderingContext2D, stroke: StrokeProps, bounds: Bounds): void {
  ctx.strokeStyle = resolveColor(ctx, stroke.color, bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.lineWidth = stroke.width;
  ctx.setLineDash(stroke.dash ?? []);
  if (stroke.cap) ctx.lineCap = stroke.cap;
  if (stroke.join) ctx.lineJoin = stroke.join;
}

function applyFill(ctx: CanvasRenderingContext2D, fill: Color, bounds: Bounds): void {
  ctx.fillStyle = resolveColor(ctx, fill, bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.fill();
}

function applyFillAndStroke(ctx: CanvasRenderingContext2D, shape: SvgStyleProps, bounds: Bounds): void {
  if (shape.fill && shape.fill !== "none") {
    applyFill(ctx, shape.fill, bounds);
  }
  if (shape.stroke) {
    applyStroke(ctx, shape.stroke, bounds);
    ctx.stroke();
  }
}

function renderSvgRect(ctx: CanvasRenderingContext2D, rect: SvgRectChild, bounds: Bounds): void {
  const { x = 0, y = 0, width, height, rx = 0, ry = 0 } = rect;
  ctx.beginPath();
  if (rx || ry) {
    ctx.roundRect(x, y, width, height, Math.max(rx, ry));
  } else {
    ctx.rect(x, y, width, height);
  }
  applyFillAndStroke(ctx, rect, bounds);
}

function renderSvgCircle(ctx: CanvasRenderingContext2D, circle: SvgCircleChild, bounds: Bounds): void {
  ctx.beginPath();
  ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2);
  applyFillAndStroke(ctx, circle, bounds);
}

function renderSvgEllipse(ctx: CanvasRenderingContext2D, ellipse: SvgEllipseChild, bounds: Bounds): void {
  ctx.beginPath();
  ctx.ellipse(ellipse.cx, ellipse.cy, ellipse.rx, ellipse.ry, 0, 0, Math.PI * 2);
  applyFillAndStroke(ctx, ellipse, bounds);
}

function renderSvgLine(ctx: CanvasRenderingContext2D, line: SvgLineChild, bounds: Bounds): void {
  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  if (line.stroke) {
    applyStroke(ctx, line.stroke, bounds);
    ctx.stroke();
  }
}

function renderSvgPolyline(ctx: CanvasRenderingContext2D, polyline: SvgPolylineChild, bounds: Bounds): void {
  const { points } = polyline;
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  applyFillAndStroke(ctx, polyline, bounds);
}

function renderSvgPolygon(ctx: CanvasRenderingContext2D, polygon: SvgPolygonChild, bounds: Bounds): void {
  const { points } = polygon;
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  applyFillAndStroke(ctx, polygon, bounds);
}

function renderSvgPath(ctx: CanvasRenderingContext2D, path: SvgPathChild, bounds: Bounds): void {
  const path2d = new Path2D(path.d);
  if (path.fill && path.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, path.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fill(path2d);
  }
  if (path.stroke) {
    applyStroke(ctx, path.stroke, bounds);
    ctx.stroke(path2d);
  }
}

const TEXT_ANCHOR_MAP: Record<string, CanvasTextAlign> = {
  start: "left",
  middle: "center",
  end: "right",
};

const BASELINE_MAP: Record<string, CanvasTextBaseline> = {
  auto: "alphabetic",
  middle: "middle",
  hanging: "hanging",
};

function renderSvgText(ctx: CanvasRenderingContext2D, text: SvgTextChild, bounds: Bounds): void {
  const { x = 0, y = 0, content, font, textAnchor = "start", dominantBaseline = "auto" } = text;

  ctx.font = buildFontString(font ?? {});
  ctx.textAlign = TEXT_ANCHOR_MAP[textAnchor] ?? "left";
  ctx.textBaseline = BASELINE_MAP[dominantBaseline] ?? "alphabetic";

  if (text.fill && text.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, text.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fillText(content, x, y);
  }
  if (text.stroke) {
    applyStroke(ctx, text.stroke, bounds);
    ctx.strokeText(content, x, y);
  }
}

function renderSvgChild(
  ctx: CanvasRenderingContext2D,
  child: SvgChild,
  parentTransform: DOMMatrix,
  bounds: Bounds,
  baseTransform: DOMMatrix
): void {
  const localTransform = applyTransform(parentTransform, child.transform);

  ctx.save();
  // 先恢复基础变换（包含 pixelRatio 缩放），再应用 SVG 变换
  ctx.setTransform(baseTransform.multiply(localTransform));

  if (child.opacity !== undefined) {
    ctx.globalAlpha *= child.opacity;
  }

  switch (child.type) {
    case "rect":
      renderSvgRect(ctx, child, bounds);
      break;
    case "circle":
      renderSvgCircle(ctx, child, bounds);
      break;
    case "ellipse":
      renderSvgEllipse(ctx, child, bounds);
      break;
    case "line":
      renderSvgLine(ctx, child, bounds);
      break;
    case "polyline":
      renderSvgPolyline(ctx, child, bounds);
      break;
    case "polygon":
      renderSvgPolygon(ctx, child, bounds);
      break;
    case "path":
      renderSvgPath(ctx, child, bounds);
      break;
    case "text":
      renderSvgText(ctx, child, bounds);
      break;
    case "g":
      renderSvgGroup(ctx, child, localTransform, bounds, baseTransform);
      break;
  }

  ctx.restore();
}

function renderSvgGroup(
  ctx: CanvasRenderingContext2D,
  group: SvgGroupChild,
  parentTransform: DOMMatrix,
  bounds: Bounds,
  baseTransform: DOMMatrix
): void {
  for (const child of group.children) {
    renderSvgChild(ctx, child, parentTransform, bounds, baseTransform);
  }
}

function calculateViewBoxTransform(
  x: number,
  y: number,
  width: number,
  height: number,
  viewBox: { x?: number; y?: number; width: number; height: number },
  preserveAspectRatio?: { align?: SvgAlign; meetOrSlice?: "meet" | "slice" }
): DOMMatrix {
  const vbX = viewBox.x ?? 0;
  const vbY = viewBox.y ?? 0;
  const vbWidth = viewBox.width;
  const vbHeight = viewBox.height;

  const scaleX = width / vbWidth;
  const scaleY = height / vbHeight;

  const align = preserveAspectRatio?.align ?? "xMidYMid";
  const meetOrSlice = preserveAspectRatio?.meetOrSlice ?? "meet";

  if (align === "none") {
    return new DOMMatrix().translate(x, y).scale(scaleX, scaleY).translate(-vbX, -vbY);
  }

  const scale = meetOrSlice === "meet" ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
  const scaledWidth = vbWidth * scale;
  const scaledHeight = vbHeight * scale;

  let translateX = x;
  let translateY = y;

  if (align.includes("xMid")) {
    translateX += (width - scaledWidth) / 2;
  } else if (align.includes("xMax")) {
    translateX += width - scaledWidth;
  }

  if (align.includes("YMid")) {
    translateY += (height - scaledHeight) / 2;
  } else if (align.includes("YMax")) {
    translateY += height - scaledHeight;
  }

  return new DOMMatrix().translate(translateX, translateY).scale(scale, scale).translate(-vbX, -vbY);
}

type Shadow = { offsetX?: number; offsetY?: number; blur?: number; color?: Color };

function applyShadow(ctx: CanvasRenderingContext2D, shadow: Shadow): void {
  ctx.shadowOffsetX = shadow.offsetX ?? 0;
  ctx.shadowOffsetY = shadow.offsetY ?? 0;
  ctx.shadowBlur = shadow.blur ?? 0;
  ctx.shadowColor = (shadow.color as string) ?? "rgba(0,0,0,0.5)";
}

function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

export function renderSvg(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as SvgElement;
  const { x, y, width, height } = node.layout;
  const bounds: Bounds = { x, y, width, height };

  if (element.background) {
    if (element.shadow) applyShadow(ctx, element.shadow);
    ctx.fillStyle = resolveColor(ctx, element.background, x, y, width, height);
    ctx.fillRect(x, y, width, height);
    if (element.shadow) clearShadow(ctx);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  const baseTransform = ctx.getTransform();
  const viewBox = element.viewBox ?? { x: 0, y: 0, width, height };
  const transform = calculateViewBoxTransform(x, y, width, height, viewBox, element.preserveAspectRatio);

  for (const child of element.children) {
    renderSvgChild(ctx, child, transform, bounds, baseTransform);
  }

  ctx.restore();
}
