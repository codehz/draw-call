import type { LayoutChild } from "@/layout/arrange/types";
import type { MeasureContext } from "@/layout/utils/measure";
import type { TransformElement } from "@/types/components";
import type { LayoutConstraints, LayoutNode } from "@/types/layout";

/**
 * 编排 Transform：布局属性对父级透明，布局树保留包装节点。
 * 包装节点与子节点共享 layout 对象，保证 stretch 等回写同步。
 */
export function arrangeTransform(
  element: TransformElement,
  ctx: MeasureContext,
  constraints: LayoutConstraints,
  x: number,
  y: number,
  layoutChild: LayoutChild
): LayoutNode {
  const childNode = layoutChild(element.children, ctx, constraints, x, y);

  return {
    element,
    layout: childNode.layout,
    children: [childNode],
  };
}
