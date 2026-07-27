import type { LayoutChild } from "@/layout/arrange/types";
import { getElementMargin } from "@/layout/utils/element";
import type { MeasureContext } from "@/layout/utils/measure";
import { applyOffset } from "@/layout/utils/offset";
import type { StackElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";

/**
 * 编排 Stack 子节点：同层叠加并对齐。
 */
export function arrangeStack(node: LayoutNode, ctx: MeasureContext, layoutChild: LayoutChild): void {
  const layoutElement = node.element as StackElement;
  const children = layoutElement.children ?? [];
  const { contentX, contentY, contentWidth, contentHeight } = node.layout;
  const stackAlign = layoutElement.align ?? "start";
  const stackJustify = layoutElement.justify ?? "start";

  for (const child of children) {
    const childNode = layoutChild(
      child,
      ctx,
      {
        minWidth: 0,
        maxWidth: contentWidth,
        minHeight: 0,
        maxHeight: contentHeight,
      },
      contentX,
      contentY
    );

    const childMargin = getElementMargin(child);
    const childOuterWidth = childNode.layout.width + childMargin.left + childMargin.right;
    const childOuterHeight = childNode.layout.height + childMargin.top + childMargin.bottom;

    let offsetX = 0;
    if (stackAlign === "center") {
      offsetX = (contentWidth - childOuterWidth) / 2;
    } else if (stackAlign === "end") {
      offsetX = contentWidth - childOuterWidth;
    }

    let offsetY = 0;
    if (stackJustify === "center") {
      offsetY = (contentHeight - childOuterHeight) / 2;
    } else if (stackJustify === "end") {
      offsetY = contentHeight - childOuterHeight;
    }

    if (offsetX !== 0 || offsetY !== 0) {
      applyOffset(childNode, offsetX, offsetY);
    }

    node.children.push(childNode);
  }
}
