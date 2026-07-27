import type { Border, NormalizedSpacing, Size } from "@/types/base";
import { getBorderWidth, normalizeSpacing } from "@/types/base";
import type { Element, LayoutElement } from "@/types/components";
import type { AlignSelf } from "@/types/layout";

export const ZERO_SPACING: NormalizedSpacing = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export interface ElementLayoutProps {
  width: Size | undefined;
  height: Size | undefined;
  flex: number | undefined;
  minWidth: number | undefined;
  maxWidth: number | undefined;
  minHeight: number | undefined;
  maxHeight: number | undefined;
  alignSelf: AlignSelf | undefined;
}

/**
 * Transform 在布局中透明：读取子元素的布局属性参与父级排版。
 * 视觉变换仅在渲染阶段生效。
 */
export function unwrapLayoutElement(element: Element): LayoutElement {
  let current: Element = element;
  while (current.type === "transform") {
    current = current.children;
  }
  return current;
}

/**
 * 安全获取元素 margin；Transform 透传到实际布局子元素。
 */
export function getElementMargin(element: Element): NormalizedSpacing {
  const layoutElement = unwrapLayoutElement(element);
  return normalizeSpacing(layoutElement.margin);
}

/**
 * 安全获取布局属性；Transform 透传到实际布局子元素。
 */
export function getElementLayoutProps(element: Element): ElementLayoutProps {
  const layoutElement = unwrapLayoutElement(element);
  return {
    width: layoutElement.width,
    height: layoutElement.height,
    flex: layoutElement.flex,
    minWidth: layoutElement.minWidth,
    maxWidth: layoutElement.maxWidth,
    minHeight: layoutElement.minHeight,
    maxHeight: layoutElement.maxHeight,
    alignSelf: layoutElement.alignSelf,
  };
}

export function getElementPadding(element: Element): NormalizedSpacing {
  const layoutElement = unwrapLayoutElement(element);
  return normalizeSpacing("padding" in layoutElement ? layoutElement.padding : undefined);
}

export function getElementBorderWidth(element: Element): number {
  const layoutElement = unwrapLayoutElement(element);
  return getBorderWidth("border" in layoutElement ? (layoutElement.border as Border | undefined) : undefined);
}

export function outerWidth(size: number, margin: NormalizedSpacing): number {
  return size + margin.left + margin.right;
}

export function outerHeight(size: number, margin: NormalizedSpacing): number {
  return size + margin.top + margin.bottom;
}
