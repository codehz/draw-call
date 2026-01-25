// 尺寸单位
export type Size = number | `${number}%` | "auto" | "fill";

// 颜色类型 - 使用 string 以兼容浏览器和 Node
export type Color = string | CanvasGradient | CanvasPattern;

// 边距/内边距
export interface Spacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

// 边框
export interface Border {
  width?: number;
  color?: Color;
  radius?: number | [number, number, number, number];
}

// 阴影
export interface Shadow {
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  color?: Color;
}

// 字体属性
export interface FontProps {
  family?: string;
  size?: number;
  weight?: number | "normal" | "bold";
  style?: "normal" | "italic";
}

// 描边属性
export interface StrokeProps {
  color: Color;
  width: number;
  dash?: number[];
  cap?: "butt" | "round" | "square";
  join?: "miter" | "round" | "bevel";
}

// 计算后的边界框
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 规范化的 Spacing
export interface NormalizedSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// 辅助函数：规范化 Spacing
export function normalizeSpacing(
  value: number | Spacing | undefined
): NormalizedSpacing {
  if (value === undefined) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  if (typeof value === "number") {
    return { top: value, right: value, bottom: value, left: value };
  }
  return {
    top: value.top ?? 0,
    right: value.right ?? 0,
    bottom: value.bottom ?? 0,
    left: value.left ?? 0,
  };
}

// 辅助函数：规范化 Border Radius
export function normalizeBorderRadius(
  value: number | [number, number, number, number] | undefined
): [number, number, number, number] {
  if (value === undefined) {
    return [0, 0, 0, 0];
  }
  if (typeof value === "number") {
    return [value, value, value, value];
  }
  return value;
}
