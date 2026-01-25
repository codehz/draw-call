// 尺寸单位
export type Size = number | `${number}%` | "auto" | "fill";

// 渐变色标
export interface ColorStop {
  offset: number; // 0-1
  color: string;
}

// 线性渐变描述符
export interface LinearGradientDescriptor {
  type: "linear-gradient";
  angle: number; // 角度（度）
  stops: ColorStop[];
}

// 径向渐变描述符
export interface RadialGradientDescriptor {
  type: "radial-gradient";
  // 起始圆（可选，默认为中心点半径0）
  startX?: number; // 0-1，相对于元素宽度
  startY?: number; // 0-1，相对于元素高度
  startRadius?: number; // 相对于元素对角线长度的比例
  // 结束圆
  endX?: number; // 0-1，相对于元素宽度
  endY?: number; // 0-1，相对于元素高度
  endRadius?: number; // 相对于元素对角线长度的比例
  stops: ColorStop[];
}

// 渐变描述符
export type GradientDescriptor = LinearGradientDescriptor | RadialGradientDescriptor;

// 颜色类型 - 使用 string 以兼容浏览器和 Node
export type Color = string | CanvasGradient | CanvasPattern | GradientDescriptor;

// 辅助函数：创建线性渐变描述符
export function linearGradient(
  angle: number,
  ...stops: (string | [number, string])[]
): LinearGradientDescriptor {
  const colorStops: ColorStop[] = stops.map((stop, index) => {
    if (typeof stop === "string") {
      // 自动计算偏移量
      return {
        offset: stops.length > 1 ? index / (stops.length - 1) : 0,
        color: stop,
      };
    }
    return { offset: stop[0], color: stop[1] };
  });

  return {
    type: "linear-gradient",
    angle,
    stops: colorStops,
  };
}

// 辅助函数：创建径向渐变描述符
export function radialGradient(
  options: {
    startX?: number;
    startY?: number;
    startRadius?: number;
    endX?: number;
    endY?: number;
    endRadius?: number;
  },
  ...stops: (string | [number, string])[]
): RadialGradientDescriptor {
  const colorStops: ColorStop[] = stops.map((stop, index) => {
    if (typeof stop === "string") {
      return {
        offset: stops.length > 1 ? index / (stops.length - 1) : 0,
        color: stop,
      };
    }
    return { offset: stop[0], color: stop[1] };
  });

  return {
    type: "radial-gradient",
    ...options,
    stops: colorStops,
  };
}

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
