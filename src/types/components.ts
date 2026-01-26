import type { Border, Color, FontProps, Shadow, StrokeProps } from "./base";
import type { ContainerLayoutProps, LayoutProps } from "./layout";

// 元素类型标识
export type ElementType = "box" | "text" | "image" | "shape" | "stack";

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

// Image 组件属性
export interface ImageProps extends LayoutProps {
  src: string | ImageBitmap | CanvasImageSource;
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

// Shape 类型
export type ShapeType = "rect" | "circle" | "ellipse" | "line" | "polygon" | "path";

// Shape 组件属性
export interface ShapeProps extends LayoutProps {
  shape: ShapeType;
  fill?: Color;
  stroke?: StrokeProps;
  shadow?: Shadow;
  points?: [number, number][];
  path?: string;
}

export interface ShapeElement extends ElementBase, ShapeProps {
  type: "shape";
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

// 所有元素类型联合
export type Element = BoxElement | TextElement | ImageElement | ShapeElement | StackElement;

// 组件工厂函数类型
export type ComponentFactory<Props, El extends Element> = (props: Props) => El;
