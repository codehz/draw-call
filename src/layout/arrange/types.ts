import type { MeasureContext } from "@/layout/utils/measure";
import type { Element } from "@/types/components";
import type { LayoutConstraints, LayoutNode } from "@/types/layout";

/**
 * 布局递归回调：编排模块通过该协议递归布局子树。
 */
export type LayoutChild = (
  element: Element,
  ctx: MeasureContext,
  constraints: LayoutConstraints,
  x?: number,
  y?: number
) => LayoutNode;

/**
 * 编排阶段公共参数。
 */
export interface ArrangeContext {
  ctx: MeasureContext;
  layoutChild: LayoutChild;
}
