import { measureIntrinsicSize } from "@/layout/measure";
import type { MeasureContext } from "@/layout/utils/measure";
import type { Border } from "@/types/base";
import { getBorderWidth, normalizeSpacing } from "@/types/base";
import type { LayoutElement } from "@/types/components";
import type { ComputedLayout, LayoutConstraints, LayoutNode } from "@/types/layout";
import { resolveSize } from "@/types/layout";

/**
 * 计算节点的 border-box / content-box 几何，并创建空子节点列表的 LayoutNode。
 */
export function createBaseLayoutNode(
  layoutElement: LayoutElement,
  ctx: MeasureContext,
  constraints: LayoutConstraints,
  x: number,
  y: number
): LayoutNode {
  const margin = normalizeSpacing(layoutElement.margin);
  const padding = normalizeSpacing("padding" in layoutElement ? layoutElement.padding : undefined);
  const borderWidth = getBorderWidth(
    "border" in layoutElement ? (layoutElement.border as Border | undefined) : undefined
  );

  const availableWidth = constraints.maxWidth - margin.left - margin.right;
  const availableHeight = constraints.maxHeight - margin.top - margin.bottom;

  const intrinsic = measureIntrinsicSize(layoutElement, ctx, availableWidth);

  let width =
    constraints.minWidth === constraints.maxWidth && constraints.minWidth > 0
      ? constraints.maxWidth - margin.left - margin.right
      : resolveSize(layoutElement.width, availableWidth, intrinsic.width);
  let height =
    constraints.minHeight === constraints.maxHeight && constraints.minHeight > 0
      ? constraints.maxHeight - margin.top - margin.bottom
      : resolveSize(layoutElement.height, availableHeight, intrinsic.height);

  if (layoutElement.minWidth !== undefined) width = Math.max(width, layoutElement.minWidth);
  if (layoutElement.maxWidth !== undefined) width = Math.min(width, layoutElement.maxWidth);
  if (layoutElement.minHeight !== undefined) height = Math.max(height, layoutElement.minHeight);
  if (layoutElement.maxHeight !== undefined) height = Math.min(height, layoutElement.maxHeight);

  const actualX = x + margin.left;
  const actualY = y + margin.top;

  const contentX = actualX + borderWidth + padding.left;
  const contentY = actualY + borderWidth + padding.top;
  const contentWidth = Math.max(0, width - borderWidth * 2 - padding.left - padding.right);
  const contentHeight = Math.max(0, height - borderWidth * 2 - padding.top - padding.bottom);

  const layout: ComputedLayout = {
    x: actualX,
    y: actualY,
    width,
    height,
    contentX,
    contentY,
    contentWidth,
    contentHeight,
  };

  return {
    element: layoutElement,
    layout,
    children: [],
  };
}
