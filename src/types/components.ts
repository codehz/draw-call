import type { Border, Color, FontProps, Shadow, StrokeProps } from "@/types/base";
import type { ContainerLayoutProps, LayoutProps } from "@/types/layout";

// 元素类型标识
export type ElementType = "box" | "text" | "richtext" | "image" | "svg" | "stack" | "transform" | "customdraw";

// CustomDraw 代理上下文选项
export interface ProxiedCanvasContextOptions {
  inner?: () => void;
  width: number;
  height: number;
}

// 元素基础接口
export interface ElementBase {
  type: ElementType;
}

// Box 组件属性
export interface BoxProps extends ContainerLayoutProps {
  background?: Color;
  border?: Border;
  shadow?: Shadow;
  opacity?: number;
  clip?: boolean;
  children?: Element[];
}

export interface BoxElement extends ElementBase, BoxProps {
  type: "box";
}

// Text 组件属性
export interface TextProps extends LayoutProps {
  content: string;
  font?: FontProps;
  color?: Color;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  maxLines?: number;
  ellipsis?: boolean;
  wrap?: boolean;
  shadow?: Shadow;
  stroke?: StrokeProps;
}

export interface TextElement extends ElementBase, TextProps {
  type: "text";
}

// RichText 文本样式属性
export interface RichTextStyleProps {
  font?: FontProps;
  color?: Color;
  background?: Color;
  underline?: boolean;
  strikethrough?: boolean;
}

// RichText 组件属性
export interface RichTextSpan extends RichTextStyleProps {
  text: string;
}

export interface RichTextProps extends LayoutProps, RichTextStyleProps {
  spans: RichTextSpan[];
  lineHeight?: number;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  maxLines?: number;
  ellipsis?: boolean;
}

export interface RichTextElement extends ElementBase, RichTextProps {
  type: "richtext";
}

// Image 组件属性
export interface ImageProps extends LayoutProps {
  src: ImageBitmap | CanvasImageSource;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  position?: {
    x?: "left" | "center" | "right" | number;
    y?: "top" | "center" | "bottom" | number;
  };
  border?: Border;
  shadow?: Shadow;
  opacity?: number;
}

export interface ImageElement extends ElementBase, ImageProps {
  type: "image";
}

// ============== SVG 图形相关类型 ==============

// 通用的图形样式属性
export interface SvgStyleProps {
  fill?: Color | "none";
  stroke?: StrokeProps;
  opacity?: number;
}

// 变换属性
export interface SvgTransformProps {
  transform?: {
    translate?: [number, number];
    /** 旋转角度（弧度）或 [angle(弧度), cx, cy](绕点旋转) */
    rotate?: number | [number, number, number]; // angle 或 [angle, cx, cy]
    scale?: number | [number, number];
    /** 水平偏移角度（弧度） */
    skewX?: number;
    /** 垂直偏移角度（弧度） */
    skewY?: number;
    matrix?: [number, number, number, number, number, number];
  };
}

// 矩形
export interface SvgRectChild extends SvgStyleProps, SvgTransformProps {
  type: "rect";
  x?: number;
  y?: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

// 圆形
export interface SvgCircleChild extends SvgStyleProps, SvgTransformProps {
  type: "circle";
  cx: number;
  cy: number;
  r: number;
}

// 椭圆
export interface SvgEllipseChild extends SvgStyleProps, SvgTransformProps {
  type: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

// 线段
export interface SvgLineChild extends SvgStyleProps, SvgTransformProps {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// 折线
export interface SvgPolylineChild extends SvgStyleProps, SvgTransformProps {
  type: "polyline";
  points: [number, number][];
}

// 多边形
export interface SvgPolygonChild extends SvgStyleProps, SvgTransformProps {
  type: "polygon";
  points: [number, number][];
}

// 路径
export interface SvgPathChild extends SvgStyleProps, SvgTransformProps {
  type: "path";
  d: string;
}

// 文本
export interface SvgTextChild extends SvgStyleProps, SvgTransformProps {
  type: "text";
  x?: number;
  y?: number;
  content: string;
  font?: FontProps;
  textAnchor?: "start" | "middle" | "end";
  dominantBaseline?: "auto" | "middle" | "hanging";
}

// 分组
export interface SvgGroupChild extends SvgStyleProps, SvgTransformProps {
  type: "g";
  children: SvgChild[];
}

// 所有图形原语的联合类型
export type SvgChild =
  | SvgRectChild
  | SvgCircleChild
  | SvgEllipseChild
  | SvgLineChild
  | SvgPolylineChild
  | SvgPolygonChild
  | SvgPathChild
  | SvgTextChild
  | SvgGroupChild;

// preserveAspectRatio 对齐值
export type SvgAlign =
  | "none"
  | "xMinYMin"
  | "xMidYMin"
  | "xMaxYMin"
  | "xMinYMid"
  | "xMidYMid"
  | "xMaxYMid"
  | "xMinYMax"
  | "xMidYMax"
  | "xMaxYMax";

// Svg 根组件属性
export interface SvgProps extends LayoutProps {
  viewBox?: {
    x?: number;
    y?: number;
    width: number;
    height: number;
  };
  preserveAspectRatio?: {
    align?: SvgAlign;
    meetOrSlice?: "meet" | "slice";
  };
  children: SvgChild[];
  background?: Color;
  shadow?: Shadow;
}

export interface SvgElement extends ElementBase, SvgProps {
  type: "svg";
}

// Stack 对齐方式
export type StackAlign = "start" | "end" | "center";

// Stack 组件属性
export interface StackProps extends LayoutProps {
  children: Element[];
  background?: Color;
  border?: Border;
  shadow?: Shadow;
  opacity?: number;
  clip?: boolean;
  /** 水平对齐方式（默认 start） */
  align?: StackAlign;
  /** 垂直对齐方式（默认 start） */
  justify?: StackAlign;
}

export interface StackElement extends ElementBase, StackProps {
  type: "stack";
}

// Transform 变换属性
// 简易对象形式
interface TransformSimpleObject {
  translate?: [number, number];
  /** 旋转角度（弧度）或 [angle(弧度), cx, cy](绕点旋转) */
  rotate?: number | [number, number, number];
  scale?: number | [number, number];
  /** 水平偏移角度（弧度） */
  skewX?: number;
  /** 垂直偏移角度（弧度） */
  skewY?: number;
}

// DOMMatrix2DInit 形式
interface DOMMatrix2DInit {
  a?: number;
  b?: number;
  c?: number;
  d?: number;
  e?: number;
  f?: number;
}

// Transform 值的三种形式
export type TransformValue = TransformSimpleObject | DOMMatrix2DInit | [number, number, number, number, number, number];

// Transform 组件属性
export interface TransformProps {
  children: Element;
  /** 变换值（rotate/skew 使用弧度） */
  transform?: TransformValue;
  /** 变换原点，默认为 [0, 0]（左上角） */
  transformOrigin?: [number | string, number | string];
}

export interface TransformElement extends ElementBase, TransformProps {
  type: "transform";
}

// CustomDraw 组件属性
export interface CustomDrawProps extends LayoutProps {
  draw: (ctx: CanvasRenderingContext2D, options: ProxiedCanvasContextOptions) => void;
  children?: Element;
}

export interface CustomDrawElement extends ElementBase, CustomDrawProps {
  type: "customdraw";
}

// 所有元素类型联合
export type Element =
  | BoxElement
  | TextElement
  | RichTextElement
  | ImageElement
  | SvgElement
  | StackElement
  | TransformElement
  | CustomDrawElement;

// 组件工厂函数类型
export type ComponentFactory<Props, El extends Element> = (props: Props) => El;
