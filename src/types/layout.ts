import type { Size, Spacing } from "./base";

// 布局方向
export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";

// 主轴对齐
export type JustifyContent = "start" | "end" | "center" | "space-between" | "space-around" | "space-evenly";

// 交叉轴对齐
export type AlignItems = "start" | "end" | "center" | "stretch" | "baseline";

// 自身对齐
export type AlignSelf = "auto" | AlignItems;

// 基础布局属性
export interface LayoutProps {
  width?: Size;
  height?: Size;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  margin?: number | Spacing;
  padding?: number | Spacing;
  flex?: number;
  alignSelf?: AlignSelf;
}

// 容器布局属性
export interface ContainerLayoutProps extends LayoutProps {
  direction?: FlexDirection;
  justify?: JustifyContent;
  align?: AlignItems;
  gap?: number;
  wrap?: boolean;
}

// 计算后的布局结果
export interface ComputedLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  contentX: number;
  contentY: number;
  contentWidth: number;
  contentHeight: number;
}

// 布局约束
export interface LayoutConstraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

// 计算可用空间大小
export function resolveSize(size: Size | undefined, available: number, auto: number): number {
  if (size === undefined || size === "auto") {
    return auto;
  }
  if (size === "fill") {
    return available;
  }
  if (typeof size === "number") {
    return size;
  }
  // 百分比
  const percent = parseFloat(size);
  return (available * percent) / 100;
}

// 判断尺寸是否需要依赖父容器
export function sizeNeedsParent(size: Size | undefined): boolean {
  if (size === undefined || size === "auto") {
    return false;
  }
  if (size === "fill") {
    return true;
  }
  if (typeof size === "string" && size.endsWith("%")) {
    return true;
  }
  return false;
}
