import { DOMMatrix } from "@/compat/DOMMatrix";
import { renderNode } from "@/render/index";
import type { TransformElement, TransformValue } from "@/types/components";
import type { LayoutNode } from "@/types/layout";

/**
 * 解析 Transform 值为 DOMMatrix
 * 支持三种格式：
 * - 数组: [a, b, c, d, e, f]
 * - DOMMatrix2DInit 对象: { a, b, c, d, e, f, ... }
 * - 简易对象: { translate, rotate, scale, skewX, skewY }
 */
export function parseTransformValue(transform: TransformValue | undefined): DOMMatrix {
  // 如果 transform 未定义，返回单位矩阵
  if (transform === undefined) {
    return new DOMMatrix();
  }

  // 如果是数组 [a, b, c, d, e, f]
  if (Array.isArray(transform)) {
    return new DOMMatrix(transform);
  }

  // 判断是 DOMMatrix2DInit 还是简易对象
  // DOMMatrix2DInit 有 a, b, c, d, e, f 等属性
  // 简易对象有 translate, rotate, scale, skewX, skewY
  const hasDOMMatrixInit =
    "a" in transform ||
    "b" in transform ||
    "c" in transform ||
    "d" in transform ||
    "e" in transform ||
    "f" in transform;
  const hasSimpleTransform =
    "translate" in transform ||
    "rotate" in transform ||
    "scale" in transform ||
    "skewX" in transform ||
    "skewY" in transform;

  if (hasDOMMatrixInit && !hasSimpleTransform) {
    // DOMMatrix2DInit 形式
    const init = transform as { a?: number; b?: number; c?: number; d?: number; e?: number; f?: number };
    return new DOMMatrix([init.a ?? 1, init.b ?? 0, init.c ?? 0, init.d ?? 1, init.e ?? 0, init.f ?? 0]);
  }

  // 简易对象形式：逐个应用变换
  const simpleObj = transform as {
    translate?: [number, number];
    rotate?: number | [number, number, number];
    scale?: number | [number, number];
    skewX?: number;
    skewY?: number;
  };

  let result = new DOMMatrix();

  if (simpleObj.translate) {
    result = result.translate(simpleObj.translate[0], simpleObj.translate[1]);
  }

  if (simpleObj.rotate !== undefined) {
    if (typeof simpleObj.rotate === "number") {
      // 单个数字：旋转角度（度数）
      result = result.rotate(simpleObj.rotate);
    } else {
      // [angle, cx, cy]：绕点 (cx, cy) 旋转
      const [angle, cx, cy] = simpleObj.rotate;
      result = result.translate(cx, cy).rotate(angle).translate(-cx, -cy);
    }
  }

  if (simpleObj.scale !== undefined) {
    if (typeof simpleObj.scale === "number") {
      // 单个数字：等比缩放
      result = result.scale(simpleObj.scale);
    } else {
      // [sx, sy]：分别缩放
      result = result.scale(simpleObj.scale[0], simpleObj.scale[1]);
    }
  }

  if (simpleObj.skewX !== undefined) {
    result = result.skewX(simpleObj.skewX);
  }

  if (simpleObj.skewY !== undefined) {
    result = result.skewY(simpleObj.skewY);
  }

  return result;
}

/**
 * 根据 transformOrigin 属性和子元素尺寸计算实际变换原点坐标
 */
export function resolveTransformOrigin(
  origin: [number | string, number | string] | undefined,
  childLayout: { width: number; height: number }
): [number, number] {
  // 默认原点为左上角
  if (origin === undefined) {
    return [0, 0];
  }

  const [xVal, yVal] = origin;
  const sizes = [childLayout.width, childLayout.height];
  const values = [xVal, yVal];

  const result: [number, number] = [0, 0];

  for (let i = 0; i < 2; i++) {
    const val = values[i];
    if (typeof val === "string") {
      if (val.endsWith("%")) {
        // 百分比格式
        const percent = parseFloat(val);
        result[i] = (percent / 100) * sizes[i];
      } else {
        // 字符串表示数字
        result[i] = parseFloat(val);
      }
    } else {
      // 数字格式
      result[i] = val;
    }
  }

  return result;
}

/**
 * 渲染 Transform 组件及其子元素
 */
export function renderTransform(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as TransformElement;
  const { children } = node;

  // 验证子元素存在且有且仅有一个
  if (!children || children.length === 0) {
    return;
  }

  const childNode = children[0];

  // 解析变换原点
  const [ox, oy] = resolveTransformOrigin(element.transformOrigin, childNode.layout);

  // 解析变换矩阵
  const targetMatrix = parseTransformValue(element.transform);

  // 构建最终矩阵：translate(ox, oy) × targetMatrix × translate(-ox, -oy)
  const finalMatrix = new DOMMatrix().translate(ox, oy).multiply(targetMatrix).translate(-ox, -oy);

  // 应用到 Canvas
  ctx.save();

  // 获取当前变换并与最终矩阵复合
  const baseTransform = ctx.getTransform();
  const composedTransform = baseTransform.multiply(finalMatrix);
  ctx.setTransform(composedTransform);

  // 递归渲染子元素
  renderNode(ctx, childNode);

  // 恢复状态
  ctx.restore();
}
