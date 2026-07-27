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
 * 安全获取元素 margin；Transform 无自身 margin，返回零间距。
 */
export function getElementMargin(element: Element): NormalizedSpacing {
  if (element.type === "transform") {
    return { ...ZERO_SPACING };
  }
  return normalizeSpacing(element.margin);
}

/**
 * 安全获取布局属性；Transform 这些属性为 undefined。
 */
export function getElementLayoutProps(element: Element): ElementLayoutProps {
  if (element.type === "transform") {
    return {
      width: undefined,
      height: undefined,
      flex: undefined,
      minWidth: undefined,
      maxWidth: undefined,
      minHeight: undefined,
      maxHeight: undefined,
      alignSelf: undefined,
    };
  }
  return {
    width: element.width,
    height: element.height,
    flex: element.flex,
    minWidth: element.minWidth,
    maxWidth: element.maxWidth,
    minHeight: element.minHeight,
    maxHeight: element.maxHeight,
    alignSelf: element.alignSelf,
  };
}

export function getElementPadding(element: Element): NormalizedSpacing {
  if (element.type === "transform") {
    return { ...ZERO_SPACING };
  }
  return normalizeSpacing("padding" in element ? element.padding : undefined);
}

export function getElementBorderWidth(element: Element): number {
  if (element.type === "transform") {
    return 0;
  }
  return getBorderWidth("border" in element ? (element.border as Border | undefined) : undefined);
}

export function outerWidth(size: number, margin: NormalizedSpacing): number {
  return size + margin.left + margin.right;
}

export function outerHeight(size: number, margin: NormalizedSpacing): number {
  return size + margin.top + margin.bottom;
}
