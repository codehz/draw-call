import { createAxisConfig } from "@/layout/utils/axis";
import { getElementMargin } from "@/layout/utils/element";
import { measureWrappedContentSize } from "@/layout/utils/flex";
import type { MeasureContext } from "@/layout/utils/measure";
import { getBorderWidth, normalizeSpacing } from "@/types/base";
import type { BoxElement, Element } from "@/types/components";

type ChildSize = {
  width: number;
  height: number;
  margin: { left: number; right: number; top: number; bottom: number };
};

function calcEffectiveSize(
  element: BoxElement,
  padding: { left: number; right: number; top: number; bottom: number },
  borderWidth: number,
  availableWidth: number
): { width: number; height: number } {
  // 数值 width/height 为 border-box，内容区再减 border 与 padding
  const effectiveWidth =
    typeof element.width === "number"
      ? Math.max(0, element.width - borderWidth * 2 - padding.left - padding.right)
      : availableWidth > 0
        ? availableWidth
        : 0;
  const effectiveHeight =
    typeof element.height === "number"
      ? Math.max(0, element.height - borderWidth * 2 - padding.top - padding.bottom)
      : 0;
  return { width: effectiveWidth, height: effectiveHeight };
}

function collectChildSizes(
  children: Element[],
  ctx: MeasureContext,
  availableWidth: number,
  padding: { left: number; right: number; top: number; bottom: number },
  borderWidth: number,
  measureChild: (el: Element, ctx: MeasureContext, width: number) => { width: number; height: number }
): ChildSize[] {
  const childSizes: ChildSize[] = [];
  for (const child of children) {
    const childMargin = getElementMargin(child);
    const childSize = measureChild(
      child,
      ctx,
      availableWidth - borderWidth * 2 - padding.left - padding.right - childMargin.left - childMargin.right
    );
    childSizes.push({
      width: childSize.width,
      height: childSize.height,
      margin: childMargin,
    });
  }
  return childSizes;
}

/**
 * 测量 Box 元素的固有尺寸
 */
export function measureBoxSize(
  element: BoxElement,
  ctx: MeasureContext,
  availableWidth: number,
  measureChild: (el: Element, ctx: MeasureContext, width: number) => { width: number; height: number }
): { width: number; height: number } {
  const padding = normalizeSpacing(element.padding);
  const borderWidth = getBorderWidth(element.border);
  const gap = element.gap ?? 0;
  const direction = element.direction ?? "row";
  const wrap = element.wrap ?? false;
  const { isRow } = createAxisConfig(direction);

  let contentWidth = 0;
  let contentHeight = 0;

  const children = element.children ?? [];

  // 计算可用于换行计算的宽度/高度
  // element.width/height 是 border-box 总尺寸（含 border + padding + content）
  const { width: effectiveWidth, height: effectiveHeight } = calcEffectiveSize(
    element,
    padding,
    borderWidth,
    availableWidth
  );

  // 如果启用了 wrap 且有可用宽度，需要模拟换行来计算正确的高度
  if (wrap && isRow && effectiveWidth > 0) {
    const childSizes = collectChildSizes(children, ctx, availableWidth, padding, borderWidth, measureChild);
    const wrapped = measureWrappedContentSize(childSizes, true, gap, effectiveWidth);
    contentWidth = wrapped.width;
    contentHeight = wrapped.height;
  } else if (wrap && !isRow && effectiveHeight > 0) {
    const childSizes = collectChildSizes(children, ctx, availableWidth, padding, borderWidth, measureChild);
    const wrapped = measureWrappedContentSize(childSizes, false, gap, effectiveHeight);
    contentWidth = wrapped.width;
    contentHeight = wrapped.height;
  } else {
    // 不换行的情况，保持原有逻辑
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childMargin = getElementMargin(child);
      const childSize = measureChild(
        child,
        ctx,
        availableWidth - borderWidth * 2 - padding.left - padding.right - childMargin.left - childMargin.right
      );

      if (isRow) {
        contentWidth += childSize.width + childMargin.left + childMargin.right;
        contentHeight = Math.max(contentHeight, childSize.height + childMargin.top + childMargin.bottom);
        if (i > 0) contentWidth += gap;
      } else {
        contentHeight += childSize.height + childMargin.top + childMargin.bottom;
        contentWidth = Math.max(contentWidth, childSize.width + childMargin.left + childMargin.right);
        if (i > 0) contentHeight += gap;
      }
    }
  }

  // 固有尺寸 = content + padding + border（border-box）
  const intrinsicWidth = contentWidth + padding.left + padding.right + borderWidth * 2;
  const intrinsicHeight = contentHeight + padding.top + padding.bottom + borderWidth * 2;

  return {
    width: typeof element.width === "number" ? element.width : intrinsicWidth,
    height: typeof element.height === "number" ? element.height : intrinsicHeight,
  };
}
