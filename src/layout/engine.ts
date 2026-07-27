import {
  arrangeBox,
  arrangeCustomDraw,
  arrangeRichText,
  arrangeStack,
  arrangeText,
  createBaseLayoutNode,
} from "@/layout/arrange";
import type { MeasureContext } from "@/layout/utils/measure";
import type { Element, LayoutElement } from "@/types/components";
import type { LayoutConstraints, LayoutNode } from "@/types/layout";

/**
 * 类型守卫：检查 Element 是否为 LayoutElement（非 Transform）
 * 由于 Transform 元素在 computeLayoutImpl 开始时被处理，
 * 此时只应处理 LayoutElement
 */
function assertLayoutElement(element: Element): asserts element is LayoutElement {
  if (element.type === "transform") {
    throw new Error("Transform elements should be handled at entry point");
  }
}

/**
 * 布局计算主函数
 * 内部使用 Element 类型以支持 Transform，外部通过 LayoutElement 约束类型
 */
export function computeLayout(
  element: LayoutElement,
  ctx: MeasureContext,
  constraints: LayoutConstraints,
  x: number = 0,
  y: number = 0
): LayoutNode {
  return computeLayoutImpl(element as Element, ctx, constraints, x, y);
}

/**
 * 内部实现函数，处理所有元素类型包括 Transform
 */
function computeLayoutImpl(
  element: Element,
  ctx: MeasureContext,
  constraints: LayoutConstraints,
  x: number = 0,
  y: number = 0
): LayoutNode {
  // Transform 元素需要特殊处理：直接委托给子元素
  if (element.type === "transform") {
    return computeLayoutImpl(element.children, ctx, constraints, x, y);
  }

  assertLayoutElement(element);
  const node = createBaseLayoutNode(element, ctx, constraints, x, y);

  switch (element.type) {
    case "text":
      arrangeText(node, ctx);
      break;
    case "richtext":
      arrangeRichText(node, ctx);
      break;
    case "stack":
      arrangeStack(node, ctx, computeLayoutImpl);
      break;
    case "box":
      arrangeBox(node, ctx, computeLayoutImpl);
      break;
    case "customdraw":
      arrangeCustomDraw(node, ctx, computeLayoutImpl);
      break;
    default:
      break;
  }

  return node;
}
