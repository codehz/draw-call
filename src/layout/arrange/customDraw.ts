import type { LayoutChild } from "@/layout/arrange/types";
import { getElementMargin } from "@/layout/utils/element";
import type { MeasureContext } from "@/layout/utils/measure";
import { normalizeSpacing } from "@/types/base";
import type { CustomDrawElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";

/**
 * 编排 CustomDraw 的可选单子节点，并在 auto 尺寸时回写容器大小。
 */
export function arrangeCustomDraw(node: LayoutNode, ctx: MeasureContext, layoutChild: LayoutChild): void {
  const layoutElement = node.element as CustomDrawElement;
  const child = layoutElement.children;
  if (!child) return;

  const padding = normalizeSpacing(layoutElement.padding);
  const { contentX, contentY, contentWidth, contentHeight } = node.layout;
  const childMargin = getElementMargin(child);

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

  node.children.push(childNode);

  if (layoutElement.width === undefined) {
    const childOuterWidth = childNode.layout.width + childMargin.left + childMargin.right;
    const actualWidth = childOuterWidth + padding.left + padding.right;
    node.layout.width = actualWidth;
    node.layout.contentWidth = childOuterWidth;
  }

  if (layoutElement.height === undefined) {
    const childOuterHeight = childNode.layout.height + childMargin.top + childMargin.bottom;
    const actualHeight = childOuterHeight + padding.top + padding.bottom;
    node.layout.height = actualHeight;
    node.layout.contentHeight = childOuterHeight;
  }
}
