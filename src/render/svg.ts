import type { LayoutNode } from "../layout/engine";
import { buildFontString } from "../layout/measure";
import type { Color, GradientDescriptor, StrokeProps } from "../types/base";
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
  SvgTextChild,
  SvgTransformProps,
} from "../types/components";

// 简单的 2D 变换矩阵实现
// 矩阵格式: [a, b, c, d, e, f] 对应:
// | a c e |
// | b d f |
// | 0 0 1 |
type Matrix = [number, number, number, number, number, number];

function identityMatrix(): Matrix {
  return [1, 0, 0, 1, 0, 0];
}

function multiplyMatrices(m1: Matrix, m2: Matrix): Matrix {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

function translateMatrix(tx: number, ty: number): Matrix {
  return [1, 0, 0, 1, tx, ty];
}

function scaleMatrix(sx: number, sy?: number): Matrix {
  return [sx, 0, 0, sy ?? sx, 0, 0];
}

function rotateMatrix(angleDeg: number): Matrix {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [cos, sin, -sin, cos, 0, 0];
}

function skewXMatrix(angleDeg: number): Matrix {
  const rad = (angleDeg * Math.PI) / 180;
  return [1, 0, Math.tan(rad), 1, 0, 0];
}

function skewYMatrix(angleDeg: number): Matrix {
  const rad = (angleDeg * Math.PI) / 180;
  return [1, Math.tan(rad), 0, 1, 0, 0];
}

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
function applyTransform(base: Matrix, transform?: SvgTransformProps["transform"]): Matrix {
  if (!transform) return base;

  let result = base;

  if (transform.matrix) {
    result = multiplyMatrices(result, transform.matrix);
  }

  if (transform.translate) {
    result = multiplyMatrices(result, translateMatrix(transform.translate[0], transform.translate[1]));
  }

  if (transform.rotate !== undefined) {
    if (typeof transform.rotate === "number") {
      result = multiplyMatrices(result, rotateMatrix(transform.rotate));
    } else {
      const [angle, cx, cy] = transform.rotate;
      result = multiplyMatrices(result, translateMatrix(cx, cy));
      result = multiplyMatrices(result, rotateMatrix(angle));
      result = multiplyMatrices(result, translateMatrix(-cx, -cy));
    }
  }

  if (transform.scale !== undefined) {
    if (typeof transform.scale === "number") {
      result = multiplyMatrices(result, scaleMatrix(transform.scale));
    } else {
      result = multiplyMatrices(result, scaleMatrix(transform.scale[0], transform.scale[1]));
    }
  }

  if (transform.skewX !== undefined) {
    result = multiplyMatrices(result, skewXMatrix(transform.skewX));
  }

  if (transform.skewY !== undefined) {
    result = multiplyMatrices(result, skewYMatrix(transform.skewY));
  }

  return result;
}

// 应用描边样式
function applyStroke(
  ctx: CanvasRenderingContext2D,
  stroke: StrokeProps,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  ctx.strokeStyle = resolveColor(ctx, stroke.color, bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.lineWidth = stroke.width;
  if (stroke.dash) {
    ctx.setLineDash(stroke.dash);
  } else {
    ctx.setLineDash([]);
  }
  if (stroke.cap) {
    ctx.lineCap = stroke.cap;
  }
  if (stroke.join) {
    ctx.lineJoin = stroke.join;
  }
}

// 渲染矩形
function renderSvgRect(
  ctx: CanvasRenderingContext2D,
  rect: SvgRectChild,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { x = 0, y = 0, width, height, rx = 0, ry = 0 } = rect;
  ctx.beginPath();
  if (rx || ry) {
    const r = Math.max(rx, ry);
    ctx.roundRect(x, y, width, height, r);
  } else {
    ctx.rect(x, y, width, height);
  }
  if (rect.fill && rect.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, rect.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fill();
  }
  if (rect.stroke) {
    applyStroke(ctx, rect.stroke, bounds);
    ctx.stroke();
  }
}

// 渲染圆形
function renderSvgCircle(
  ctx: CanvasRenderingContext2D,
  circle: SvgCircleChild,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { cx, cy, r } = circle;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (circle.fill && circle.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, circle.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fill();
  }
  if (circle.stroke) {
    applyStroke(ctx, circle.stroke, bounds);
    ctx.stroke();
  }
}

// 渲染椭圆
function renderSvgEllipse(
  ctx: CanvasRenderingContext2D,
  ellipse: SvgEllipseChild,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { cx, cy, rx, ry } = ellipse;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  if (ellipse.fill && ellipse.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, ellipse.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fill();
  }
  if (ellipse.stroke) {
    applyStroke(ctx, ellipse.stroke, bounds);
    ctx.stroke();
  }
}

// 渲染线段
function renderSvgLine(
  ctx: CanvasRenderingContext2D,
  line: SvgLineChild,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { x1, y1, x2, y2 } = line;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  if (line.stroke) {
    applyStroke(ctx, line.stroke, bounds);
    ctx.stroke();
  }
}

// 渲染折线
function renderSvgPolyline(
  ctx: CanvasRenderingContext2D,
  polyline: SvgPolylineChild,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { points } = polyline;
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  if (polyline.fill && polyline.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, polyline.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fill();
  }
  if (polyline.stroke) {
    applyStroke(ctx, polyline.stroke, bounds);
    ctx.stroke();
  }
}

// 渲染多边形
function renderSvgPolygon(
  ctx: CanvasRenderingContext2D,
  polygon: SvgPolygonChild,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { points } = polygon;
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  if (polygon.fill && polygon.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, polygon.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fill();
  }
  if (polygon.stroke) {
    applyStroke(ctx, polygon.stroke, bounds);
    ctx.stroke();
  }
}

// 懒加载 Path2D 构造函数
let Path2DConstructor: typeof Path2D | undefined;

function getPath2D(): typeof Path2D {
  if (Path2DConstructor) return Path2DConstructor;

  // 尝试使用全局 Path2D (浏览器环境)
  if (typeof Path2D !== "undefined") {
    Path2DConstructor = Path2D;
    return Path2DConstructor;
  }

  // 尝试从 @napi-rs/canvas 加载 (Node.js 环境)
  try {
    // use iife to prevent static analysis
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const napiCanvas = require((() => "@napi-rs/canvas")()) as typeof import("@napi-rs/canvas");
    Path2DConstructor = napiCanvas.Path2D as typeof Path2D;
    return Path2DConstructor!;
  } catch {
    throw new Error("Path2D is not available. In Node.js, install @napi-rs/canvas.");
  }
}

// 渲染路径
function renderSvgPath(
  ctx: CanvasRenderingContext2D,
  path: SvgPathChild,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const P2D = getPath2D();
  const path2d = new P2D(path.d);
  if (path.fill && path.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, path.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fill(path2d);
  }
  if (path.stroke) {
    applyStroke(ctx, path.stroke, bounds);
    ctx.stroke(path2d);
  }
}

// 渲染文本
function renderSvgText(
  ctx: CanvasRenderingContext2D,
  text: SvgTextChild,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { x = 0, y = 0, content, font, textAnchor = "start", dominantBaseline = "auto" } = text;

  ctx.font = buildFontString(font ?? {});

  // 设置文本对齐
  if (textAnchor === "start") {
    ctx.textAlign = "left";
  } else if (textAnchor === "middle") {
    ctx.textAlign = "center";
  } else {
    ctx.textAlign = "right";
  }

  // 设置基线
  if (dominantBaseline === "auto") {
    ctx.textBaseline = "alphabetic";
  } else if (dominantBaseline === "middle") {
    ctx.textBaseline = "middle";
  } else {
    ctx.textBaseline = "hanging";
  }

  if (text.fill && text.fill !== "none") {
    ctx.fillStyle = resolveColor(ctx, text.fill, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fillText(content, x, y);
  }
  if (text.stroke) {
    applyStroke(ctx, text.stroke, bounds);
    ctx.strokeText(content, x, y);
  }
}

// 渲染子图形
function renderSvgChild(
  ctx: CanvasRenderingContext2D,
  child: SvgChild,
  parentTransform: Matrix,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const localTransform = applyTransform(parentTransform, child.transform);

  ctx.save();
  ctx.setTransform(...localTransform);

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
      renderSvgGroup(ctx, child, localTransform, bounds);
      break;
  }

  ctx.restore();
}

// 渲染分组
function renderSvgGroup(
  ctx: CanvasRenderingContext2D,
  group: SvgGroupChild,
  parentTransform: Matrix,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  for (const child of group.children) {
    renderSvgChild(ctx, child, parentTransform, bounds);
  }
}

// 计算 viewBox 变换
function calculateViewBoxTransform(
  x: number,
  y: number,
  width: number,
  height: number,
  viewBox: { x?: number; y?: number; width: number; height: number },
  preserveAspectRatio?: { align?: SvgAlign; meetOrSlice?: "meet" | "slice" }
): Matrix {
  const vbX = viewBox.x ?? 0;
  const vbY = viewBox.y ?? 0;
  const vbWidth = viewBox.width;
  const vbHeight = viewBox.height;

  const scaleX = width / vbWidth;
  const scaleY = height / vbHeight;

  const align = preserveAspectRatio?.align ?? "xMidYMid";
  const meetOrSlice = preserveAspectRatio?.meetOrSlice ?? "meet";

  let scale: number;
  let translateX = x;
  let translateY = y;

  if (align === "none") {
    // translate(x, y) -> scale(scaleX, scaleY) -> translate(-vbX, -vbY)
    let result = identityMatrix();
    result = multiplyMatrices(result, translateMatrix(x, y));
    result = multiplyMatrices(result, scaleMatrix(scaleX, scaleY));
    result = multiplyMatrices(result, translateMatrix(-vbX, -vbY));
    return result;
  }

  if (meetOrSlice === "meet") {
    scale = Math.min(scaleX, scaleY);
  } else {
    scale = Math.max(scaleX, scaleY);
  }

  const scaledWidth = vbWidth * scale;
  const scaledHeight = vbHeight * scale;

  // X 对齐
  if (align.includes("xMid")) {
    translateX += (width - scaledWidth) / 2;
  } else if (align.includes("xMax")) {
    translateX += width - scaledWidth;
  }

  // Y 对齐
  if (align.includes("YMid")) {
    translateY += (height - scaledHeight) / 2;
  } else if (align.includes("YMax")) {
    translateY += height - scaledHeight;
  }

  // translate(translateX, translateY) -> scale(scale) -> translate(-vbX, -vbY)
  let result = identityMatrix();
  result = multiplyMatrices(result, translateMatrix(translateX, translateY));
  result = multiplyMatrices(result, scaleMatrix(scale));
  result = multiplyMatrices(result, translateMatrix(-vbX, -vbY));
  return result;
}

// 应用阴影
function applyShadow(
  ctx: CanvasRenderingContext2D,
  shadow: { offsetX?: number; offsetY?: number; blur?: number; color?: Color }
): void {
  ctx.shadowOffsetX = shadow.offsetX ?? 0;
  ctx.shadowOffsetY = shadow.offsetY ?? 0;
  ctx.shadowBlur = shadow.blur ?? 0;
  ctx.shadowColor = (shadow.color as string) ?? "rgba(0,0,0,0.5)";
}

// 清除阴影
function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

// 渲染 SVG 元素
export function renderSvg(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as SvgElement;
  const { x, y, width, height } = node.layout;

  // 绘制背景
  if (element.background) {
    if (element.shadow) {
      applyShadow(ctx, element.shadow);
    }
    ctx.fillStyle = resolveColor(ctx, element.background, x, y, width, height);
    ctx.fillRect(x, y, width, height);
    if (element.shadow) {
      clearShadow(ctx);
    }
  }

  ctx.save();

  // 设置裁剪区域
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  // 计算 viewBox 变换
  const viewBox = element.viewBox ?? { x: 0, y: 0, width, height };
  const transform = calculateViewBoxTransform(x, y, width, height, viewBox, element.preserveAspectRatio);

  const bounds = { x, y, width, height };

  // 渲染子图形
  for (const child of element.children) {
    renderSvgChild(ctx, child, transform, bounds);
  }

  ctx.restore();
}
