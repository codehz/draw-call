// 主入口文件 - 浏览器环境
export { createCanvas } from "@/canvas";
export type { CanvasOptions, DrawCallCanvas, LayoutSize } from "@/canvas";

// 组件
export { Box, Image, RichText, Stack, Svg, Text, Transform, svg } from "@/components";

// 渐变辅助函数
export { linearGradient, radialGradient } from "@/types/base";

// 布局打印工具
export { layoutToString, printLayout } from "@/layout";

// 类型导出
export type {
  Border,
  Bounds,
  Color,
  ColorStop,
  FontProps,
  GradientDescriptor,
  LinearGradientDescriptor,
  RadialGradientDescriptor,
  Shadow,
  Size,
  Spacing,
  StrokeProps,
} from "@/types/base";

export type {
  AlignItems,
  AlignSelf,
  ContainerLayoutProps,
  FlexDirection,
  JustifyContent,
  LayoutProps,
} from "@/types/layout";

export type {
  BoxElement,
  BoxProps,
  Element,
  RichTextElement,
  RichTextProps,
  RichTextSpan,
  StackAlign,
  StackElement,
  StackProps,
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
  SvgProps,
  SvgRectChild,
  SvgStyleProps,
  SvgTextChild,
  SvgTransformProps,
  TextElement,
  TextProps,
  TransformElement,
  TransformProps,
} from "@/types/components";

// 布局工具（高级用法）
export { computeLayout, createCanvasMeasureContext } from "@/layout";
export type { MeasureContext } from "@/layout";
export type { LayoutNode } from "@/types/layout";
