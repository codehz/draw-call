import type { LayoutChild } from "@/layout/arrange/types";
import { measureIntrinsicSize } from "@/layout/measure";
import { createAxisConfig } from "@/layout/utils/axis";
import { getElementLayoutProps, getElementMargin, getElementPadding } from "@/layout/utils/element";
import { groupFlexLines, lineCrossSize, lineMainSize, resolveMainAxisPlacement } from "@/layout/utils/flex";
import type { MeasureContext } from "@/layout/utils/measure";
import type { NormalizedSpacing } from "@/types/base";
import { normalizeSpacing } from "@/types/base";
import type { BoxElement, Element } from "@/types/components";
import type { LayoutNode } from "@/types/layout";
import { resolveSize, sizeNeedsParent } from "@/types/layout";

interface ChildInfo {
  element: Element;
  width: number;
  height: number;
  flex: number;
  margin: NormalizedSpacing;
}

/**
 * 编排 Box 的 Flex 子节点。
 */
export function arrangeBox(node: LayoutNode, ctx: MeasureContext, layoutChild: LayoutChild): void {
  const boxElement = node.element as BoxElement;
  const children = boxElement.children ?? [];
  const padding = normalizeSpacing(boxElement.padding);
  const { contentX, contentY, contentWidth, contentHeight } = node.layout;

  const direction = boxElement.direction ?? "row";
  const justify = boxElement.justify ?? "start";
  const align = boxElement.align ?? "stretch";
  const gap = boxElement.gap ?? 0;
  const wrap = boxElement.wrap ?? false;
  const { isRow, isReverse } = createAxisConfig(direction);

  const getContentMainSize = () => (isRow ? contentWidth : contentHeight);
  const getContentCrossSize = () => (isRow ? contentHeight : contentWidth);

  const childInfos: ChildInfo[] = [];

  for (const child of children) {
    const childMargin = getElementMargin(child);
    const childProps = getElementLayoutProps(child);
    const childFlex = childProps.flex ?? 0;

    if (childFlex > 0) {
      childInfos.push({
        element: child,
        width: 0,
        height: 0,
        flex: childFlex,
        margin: childMargin,
      });
    } else {
      const size = measureIntrinsicSize(child, ctx, contentWidth - childMargin.left - childMargin.right);

      const shouldStretchWidth = !isRow && childProps.width === undefined && align === "stretch";
      const shouldStretchHeight = isRow && childProps.height === undefined && align === "stretch";

      let w = sizeNeedsParent(childProps.width)
        ? resolveSize(childProps.width, contentWidth - childMargin.left - childMargin.right, size.width)
        : resolveSize(childProps.width, 0, size.width);
      let h = sizeNeedsParent(childProps.height)
        ? resolveSize(childProps.height, contentHeight - childMargin.top - childMargin.bottom, size.height)
        : resolveSize(childProps.height, 0, size.height);

      if (shouldStretchWidth && !wrap) {
        w = contentWidth - childMargin.left - childMargin.right;
      }
      if (shouldStretchHeight && !wrap) {
        h = contentHeight - childMargin.top - childMargin.bottom;
      }

      childInfos.push({
        element: child,
        width: w,
        height: h,
        flex: 0,
        margin: childMargin,
      });
    }
  }

  const lines = groupFlexLines(childInfos, isRow, gap, getContentMainSize(), wrap);

  for (const lineInfos of lines) {
    let totalFixed = 0;
    let totalFlex = 0;
    const totalGap = lineInfos.length > 1 ? gap * (lineInfos.length - 1) : 0;

    for (const info of lineInfos) {
      if (info.flex > 0) {
        totalFlex += info.flex;
      } else if (isRow) {
        totalFixed += info.width + info.margin.left + info.margin.right;
      } else {
        totalFixed += info.height + info.margin.top + info.margin.bottom;
      }
    }

    const mainAxisSize = getContentMainSize();
    const availableForFlex = Math.max(0, mainAxisSize - totalFixed - totalGap);

    for (const info of lineInfos) {
      if (info.flex > 0) {
        const flexSize = totalFlex > 0 ? (availableForFlex * info.flex) / totalFlex : 0;
        const childProps = getElementLayoutProps(info.element);
        if (isRow) {
          info.width = flexSize;
          const size = measureIntrinsicSize(info.element, ctx, flexSize);
          info.height = sizeNeedsParent(childProps.height)
            ? resolveSize(childProps.height, contentHeight - info.margin.top - info.margin.bottom, size.height)
            : resolveSize(childProps.height, 0, size.height);
        } else {
          info.height = flexSize;
          const size = measureIntrinsicSize(info.element, ctx, contentWidth - info.margin.left - info.margin.right);
          info.width = sizeNeedsParent(childProps.width)
            ? resolveSize(childProps.width, contentWidth - info.margin.left - info.margin.right, size.width)
            : resolveSize(childProps.width, 0, size.width);
        }
      }
    }
  }

  let crossOffset = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineInfos = lines[lineIndex];
    const totalSize = lineMainSize(lineInfos, isRow, gap);
    const mainAxisSize = getContentMainSize();
    const freeSpace = mainAxisSize - totalSize;
    const { mainStart, mainGap } = resolveMainAxisPlacement(justify, freeSpace, lineInfos.length, gap);
    const lineCross = lineCrossSize(lineInfos, isRow);

    let mainOffset = mainStart;
    const orderedInfos = isReverse ? [...lineInfos].reverse() : lineInfos;

    for (let i = 0; i < orderedInfos.length; i++) {
      const info = orderedInfos[i];
      const childProps = getElementLayoutProps(info.element);
      const crossAxisSize = wrap ? lineCross : getContentCrossSize();
      const childCrossSize = isRow
        ? info.height + info.margin.top + info.margin.bottom
        : info.width + info.margin.left + info.margin.right;

      let itemCrossOffset = 0;
      const effectiveAlign = childProps.alignSelf ?? align;

      if (effectiveAlign === "start") {
        itemCrossOffset = 0;
      } else if (effectiveAlign === "end") {
        itemCrossOffset = crossAxisSize - childCrossSize;
      } else if (effectiveAlign === "center") {
        itemCrossOffset = (crossAxisSize - childCrossSize) / 2;
      } else if (effectiveAlign === "stretch") {
        itemCrossOffset = 0;
        if (isRow && childProps.height === undefined) {
          info.height = crossAxisSize - info.margin.top - info.margin.bottom;
        } else if (!isRow && childProps.width === undefined) {
          info.width = crossAxisSize - info.margin.left - info.margin.right;
        }
      }

      const childX = isRow
        ? contentX + mainOffset + info.margin.left
        : contentX + crossOffset + itemCrossOffset + info.margin.left;
      const childY = isRow
        ? contentY + crossOffset + itemCrossOffset + info.margin.top
        : contentY + mainOffset + info.margin.top;

      let minWidth = 0;
      let maxWidth = info.width;
      let minHeight = 0;
      let maxHeight = info.height;
      let shouldStretchCross = false;

      if (info.flex > 0) {
        if (isRow) {
          minWidth = maxWidth = info.width;
          if (childProps.height === undefined && align === "stretch") {
            minHeight = info.height;
            maxHeight = boxElement.height !== undefined ? info.height : Infinity;
            shouldStretchCross = true;
          }
        } else {
          minHeight = maxHeight = info.height;
          if (childProps.width === undefined && align === "stretch") {
            minWidth = info.width;
            maxWidth = boxElement.width !== undefined ? info.width : Infinity;
            shouldStretchCross = true;
          }
        }
      } else {
        if (!isRow && childProps.width === undefined && align === "stretch") {
          minWidth = maxWidth = crossAxisSize - info.margin.left - info.margin.right;
        }
        if (isRow && childProps.height === undefined && align === "stretch") {
          minHeight = maxHeight = crossAxisSize - info.margin.top - info.margin.bottom;
        }
      }

      const childNode = layoutChild(
        info.element,
        ctx,
        {
          minWidth,
          maxWidth,
          minHeight,
          maxHeight,
        },
        childX - info.margin.left,
        childY - info.margin.top
      );

      if (shouldStretchCross && info.flex > 0) {
        const childPadding = getElementPadding(info.element);

        if (isRow && childNode.layout.height < info.height) {
          childNode.layout.height = info.height;
          childNode.layout.contentHeight = info.height - childPadding.top - childPadding.bottom;
        } else if (!isRow && childNode.layout.width < info.width) {
          childNode.layout.width = info.width;
          childNode.layout.contentWidth = info.width - childPadding.left - childPadding.right;
        }
      }

      node.children.push(childNode);

      mainOffset += isRow
        ? info.width + info.margin.left + info.margin.right
        : info.height + info.margin.top + info.margin.bottom;
      if (i < orderedInfos.length - 1) {
        mainOffset += mainGap;
      }
    }

    crossOffset += lineCross;
    if (lineIndex < lines.length - 1) {
      crossOffset += gap;
    }
  }

  if (wrap && boxElement.height === undefined && isRow) {
    const actualContentHeight = crossOffset;
    const actualHeight = actualContentHeight + padding.top + padding.bottom;
    node.layout.height = actualHeight;
    node.layout.contentHeight = actualContentHeight;
  } else if (wrap && boxElement.width === undefined && !isRow) {
    const actualContentWidth = crossOffset;
    const actualWidth = actualContentWidth + padding.left + padding.right;
    node.layout.width = actualWidth;
    node.layout.contentWidth = actualContentWidth;
  }

  if (!wrap) {
    let maxChildCrossSize = 0;
    for (const childNode of node.children) {
      const childMargin = getElementMargin(childNode.element);
      if (isRow) {
        const childOuterHeight = childNode.layout.height + childMargin.top + childMargin.bottom;
        maxChildCrossSize = Math.max(maxChildCrossSize, childOuterHeight);
      } else {
        const childOuterWidth = childNode.layout.width + childMargin.left + childMargin.right;
        maxChildCrossSize = Math.max(maxChildCrossSize, childOuterWidth);
      }
    }

    if (isRow && boxElement.height === undefined) {
      const actualHeight = maxChildCrossSize + padding.top + padding.bottom;
      if (actualHeight > node.layout.height) {
        node.layout.height = actualHeight;
        node.layout.contentHeight = maxChildCrossSize;
      }
    } else if (!isRow && boxElement.width === undefined) {
      const actualWidth = maxChildCrossSize + padding.left + padding.right;
      if (actualWidth > node.layout.width) {
        node.layout.width = actualWidth;
        node.layout.contentWidth = maxChildCrossSize;
      }
    }
  }

  if (isReverse) {
    node.children.reverse();
  }
}
