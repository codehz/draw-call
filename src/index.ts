// 主入口文件
export { createCanvas, createCanvasAsync } from "./canvas";
export type { CanvasOptions, DrawCallCanvas, LayoutSize } from "./canvas";

// 组件
export { Box, Text, Stack } from "./components";

// 渐变辅助函数
export { linearGradient, radialGradient } from "./types/base";

// 类型导出
export type {
  Size,
  Color,
  Spacing,
  Border,
  Shadow,
  FontProps,
  StrokeProps,
  Bounds,
  ColorStop,
  LinearGradientDescriptor,
  RadialGradientDescriptor,
  GradientDescriptor,
} from "./types/base";

export type {
  FlexDirection,
  JustifyContent,
  AlignItems,
  AlignSelf,
  LayoutProps,
  ContainerLayoutProps,
} from "./types/layout";

export type {
  Element,
  BoxProps,
  BoxElement,
  TextProps,
  TextElement,
  StackProps,
  StackElement,
} from "./types/components";

// 布局工具（高级用法）
export { computeLayout, createCanvasMeasureContext } from "./layout";
export type { LayoutNode, MeasureContext } from "./layout";
