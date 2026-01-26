import { measureIntrinsicSize } from "@/layout/components";
import type { MeasureContext } from "@/layout/utils/measure";
import { truncateText, wrapText } from "@/layout/utils/measure";
import { applyOffset } from "@/layout/utils/offset";
import type { NormalizedSpacing } from "@/types/base";
import { normalizeSpacing } from "@/types/base";
import type { Element } from "@/types/components";
import type { ComputedLayout, LayoutConstraints } from "@/types/layout";
import { resolveSize, sizeNeedsParent } from "@/types/layout";

// 布局节点 - 包含计算后的布局信息
export interface LayoutNode {
  element: Element;
  layout: ComputedLayout;
  children: LayoutNode[];
  // 文本特有属性
  lines?: string[];
  // 每行文本的基线偏移量（用于修正 middle 基线）
  lineOffsets?: number[];
}

// 布局计算主函数
export function computeLayout(
  element: Element,
  ctx: MeasureContext,
  constraints: LayoutConstraints,
  x: number = 0,
  y: number = 0
): LayoutNode {
  const margin = normalizeSpacing(element.margin);
  const padding = normalizeSpacing("padding" in element ? element.padding : undefined);

  // 计算可用空间（减去 margin）
  const availableWidth = constraints.maxWidth - margin.left - margin.right;
  const availableHeight = constraints.maxHeight - margin.top - margin.bottom;

  // 测量固有尺寸
  const intrinsic = measureIntrinsicSize(element, ctx, availableWidth);

  // 解析宽高
  // 当 minWidth === maxWidth 时，说明父容器（Flex）强制了宽度，应该直接使用约束值
  let width =
    constraints.minWidth === constraints.maxWidth && constraints.minWidth > 0
      ? constraints.maxWidth - margin.left - margin.right
      : resolveSize(element.width, availableWidth, intrinsic.width);
  let height =
    constraints.minHeight === constraints.maxHeight && constraints.minHeight > 0
      ? constraints.maxHeight - margin.top - margin.bottom
      : resolveSize(element.height, availableHeight, intrinsic.height);

  // 应用 min/max 约束
  if (element.minWidth !== undefined) width = Math.max(width, element.minWidth);
  if (element.maxWidth !== undefined) width = Math.min(width, element.maxWidth);
  if (element.minHeight !== undefined) height = Math.max(height, element.minHeight);
  if (element.maxHeight !== undefined) height = Math.min(height, element.maxHeight);

  // 计算实际位置
  const actualX = x + margin.left;
  const actualY = y + margin.top;

  // 内容区域
  const contentX = actualX + padding.left;
  const contentY = actualY + padding.top;
  const contentWidth = width - padding.left - padding.right;
  const contentHeight = height - padding.top - padding.bottom;

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

  const node: LayoutNode = {
    element,
    layout,
    children: [],
  };

  // 处理文本元素的行
  if (element.type === "text") {
    const font = element.font ?? {};
    if (element.wrap && contentWidth > 0) {
      let { lines, offsets } = wrapText(ctx, element.content, contentWidth, font);
      if (element.maxLines && lines.length > element.maxLines) {
        lines = lines.slice(0, element.maxLines);
        offsets = offsets.slice(0, element.maxLines);
        if (element.ellipsis && lines.length > 0) {
          const lastIdx = lines.length - 1;
          const truncated = truncateText(ctx, lines[lastIdx], contentWidth, font);
          lines[lastIdx] = truncated.text;
          offsets[lastIdx] = truncated.offset;
        }
      }
      node.lines = lines;
      node.lineOffsets = offsets;
    } else {
      const { text, offset } = truncateText(
        ctx,
        element.content,
        contentWidth > 0 && element.ellipsis ? contentWidth : Infinity,
        font
      );
      node.lines = [text];
      node.lineOffsets = [offset];
    }
  }

  // 递归处理子元素
  if (element.type === "box" || element.type === "stack") {
    const children = element.children ?? [];

    if (element.type === "stack") {
      // Stack: 所有子元素在同一位置开始，支持对齐
      const stackAlign = element.align ?? "start";
      const stackJustify = element.justify ?? "start";

      for (const child of children) {
        // 先在原点布局以获取子元素尺寸
        const childNode = computeLayout(
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

        // 根据对齐方式计算偏移
        const childMargin = normalizeSpacing(child.margin);
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

        // 应用偏移
        if (offsetX !== 0 || offsetY !== 0) {
          applyOffset(childNode, offsetX, offsetY);
        }

        node.children.push(childNode);
      }
    } else {
      // Box: Flex 布局
      const direction = element.direction ?? "row";
      const justify = element.justify ?? "start";
      const align = element.align ?? "stretch";
      const gap = element.gap ?? 0;
      const wrap = element.wrap ?? false;
      const isRow = direction === "row" || direction === "row-reverse";
      const isReverse = direction === "row-reverse" || direction === "column-reverse";

      // 第一遍：计算所有非 flex 子元素的尺寸
      const childInfos: Array<{
        element: Element;
        width: number;
        height: number;
        flex: number;
        margin: NormalizedSpacing;
      }> = [];

      for (const child of children) {
        const childMargin = normalizeSpacing(child.margin);
        const childFlex = child.flex ?? 0;

        if (childFlex > 0) {
          childInfos.push({
            element: child,
            width: 0,
            height: 0,
            flex: childFlex,
            margin: childMargin,
          });
        } else {
          // 非 flex 元素，测量固有尺寸
          const size = measureIntrinsicSize(
            child,
            ctx,
            isRow
              ? contentWidth - childMargin.left - childMargin.right
              : contentWidth - childMargin.left - childMargin.right
          );

          // 判断是否需要在交叉轴 stretch
          // 当元素在交叉轴上没有指定尺寸且 align="stretch" 时，应该拉伸
          const shouldStretchWidth = !isRow && child.width === undefined && align === "stretch";
          const shouldStretchHeight = isRow && child.height === undefined && align === "stretch";

          // 解析明确指定的尺寸
          let w = sizeNeedsParent(child.width)
            ? resolveSize(child.width, contentWidth - childMargin.left - childMargin.right, size.width)
            : resolveSize(child.width, 0, size.width);
          let h = sizeNeedsParent(child.height)
            ? resolveSize(child.height, contentHeight - childMargin.top - childMargin.bottom, size.height)
            : resolveSize(child.height, 0, size.height);

          // 应用 stretch（注意：wrap 时不应提前应用 stretch）
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

      // 如果启用 wrap，将子元素分组到多行/列
      const lines: Array<typeof childInfos> = [];
      if (wrap) {
        let currentLine: typeof childInfos = [];
        let currentLineSize = 0;
        const mainAxisSize = isRow ? contentWidth : contentHeight;

        for (const info of childInfos) {
          const itemSize = isRow
            ? info.width + info.margin.left + info.margin.right
            : info.height + info.margin.top + info.margin.bottom;

          // 检查是否需要换行
          const needsWrap = currentLine.length > 0 && currentLineSize + gap + itemSize > mainAxisSize;

          if (needsWrap) {
            // 换行
            lines.push(currentLine);
            currentLine = [info];
            currentLineSize = itemSize;
          } else {
            currentLine.push(info);
            currentLineSize += (currentLine.length > 1 ? gap : 0) + itemSize;
          }
        }

        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
      } else {
        // 不换行，所有元素在一行
        lines.push(childInfos);
      }

      // 计算 flex 元素的尺寸（每行分别计算）
      for (const lineInfos of lines) {
        let totalFixed = 0;
        let totalFlex = 0;
        const totalGap = lineInfos.length > 1 ? gap * (lineInfos.length - 1) : 0;

        for (const info of lineInfos) {
          if (info.flex > 0) {
            totalFlex += info.flex;
          } else {
            if (isRow) {
              totalFixed += info.width + info.margin.left + info.margin.right;
            } else {
              totalFixed += info.height + info.margin.top + info.margin.bottom;
            }
          }
        }

        const mainAxisSize = isRow ? contentWidth : contentHeight;
        const availableForFlex = Math.max(0, mainAxisSize - totalFixed - totalGap);

        for (const info of lineInfos) {
          if (info.flex > 0) {
            const flexSize = totalFlex > 0 ? (availableForFlex * info.flex) / totalFlex : 0;
            if (isRow) {
              info.width = flexSize;
              // 测量高度
              const size = measureIntrinsicSize(info.element, ctx, flexSize);
              info.height = sizeNeedsParent(info.element.height)
                ? resolveSize(info.element.height, contentHeight - info.margin.top - info.margin.bottom, size.height)
                : resolveSize(info.element.height, 0, size.height);
            } else {
              info.height = flexSize;
              // 测量宽度
              const size = measureIntrinsicSize(info.element, ctx, contentWidth - info.margin.left - info.margin.right);
              info.width = sizeNeedsParent(info.element.width)
                ? resolveSize(info.element.width, contentWidth - info.margin.left - info.margin.right, size.width)
                : resolveSize(info.element.width, 0, size.width);
            }
          }
        }
      }

      // 布局每一行/列
      let crossOffset = 0;

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const lineInfos = lines[lineIndex];
        // 计算该行的主轴总尺寸
        const totalGap = lineInfos.length > 1 ? gap * (lineInfos.length - 1) : 0;
        const totalSize =
          lineInfos.reduce((sum, info) => {
            if (isRow) {
              return sum + info.width + info.margin.left + info.margin.right;
            } else {
              return sum + info.height + info.margin.top + info.margin.bottom;
            }
          }, 0) + totalGap;

        const mainAxisSize = isRow ? contentWidth : contentHeight;
        const freeSpace = mainAxisSize - totalSize;

        let mainStart = 0;
        let mainGap = gap;

        switch (justify) {
          case "start":
            mainStart = 0;
            break;
          case "end":
            mainStart = freeSpace;
            break;
          case "center":
            mainStart = freeSpace / 2;
            break;
          case "space-between":
            mainStart = 0;
            if (lineInfos.length > 1) {
              mainGap = gap + freeSpace / (lineInfos.length - 1);
            }
            break;
          case "space-around":
            if (lineInfos.length > 0) {
              const spacing = freeSpace / lineInfos.length;
              mainStart = spacing / 2;
              mainGap = gap + spacing;
            }
            break;
          case "space-evenly":
            if (lineInfos.length > 0) {
              const spacing = freeSpace / (lineInfos.length + 1);
              mainStart = spacing;
              mainGap = gap + spacing;
            }
            break;
        }

        // 计算该行的交叉轴尺寸
        const lineCrossSize = lineInfos.reduce((max, info) => {
          const itemCrossSize = isRow
            ? info.height + info.margin.top + info.margin.bottom
            : info.width + info.margin.left + info.margin.right;
          return Math.max(max, itemCrossSize);
        }, 0);

        // 布局该行的子元素
        let mainOffset = mainStart;
        const orderedInfos = isReverse ? [...lineInfos].reverse() : lineInfos;

        for (let i = 0; i < orderedInfos.length; i++) {
          const info = orderedInfos[i];
          const crossAxisSize = wrap ? lineCrossSize : isRow ? contentHeight : contentWidth;
          const childCrossSize = isRow
            ? info.height + info.margin.top + info.margin.bottom
            : info.width + info.margin.left + info.margin.right;

          // 计算交叉轴位置
          let itemCrossOffset = 0;
          const effectiveAlign =
            info.element.alignSelf === "auto" || info.element.alignSelf === undefined ? align : info.element.alignSelf;

          switch (effectiveAlign) {
            case "start":
              itemCrossOffset = 0;
              break;
            case "end":
              itemCrossOffset = crossAxisSize - childCrossSize;
              break;
            case "center":
              itemCrossOffset = (crossAxisSize - childCrossSize) / 2;
              break;
            case "stretch":
              itemCrossOffset = 0;
              if (isRow && info.element.height === undefined) {
                info.height = crossAxisSize - info.margin.top - info.margin.bottom;
              } else if (!isRow && info.element.width === undefined) {
                info.width = crossAxisSize - info.margin.left - info.margin.right;
              }
              break;
            case "baseline":
              // TODO: 实现 baseline 对齐
              itemCrossOffset = 0;
              break;
          }

          const childX = isRow
            ? contentX + mainOffset + info.margin.left
            : contentX + crossOffset + itemCrossOffset + info.margin.left;
          const childY = isRow
            ? contentY + crossOffset + itemCrossOffset + info.margin.top
            : contentY + mainOffset + info.margin.top;

          // 对于 flex 子元素，需要强制使用计算出的 flex 尺寸
          // 对于非 flex 子元素，处理 stretch 对约束的影响
          let minWidth = 0;
          let maxWidth = info.width;
          let minHeight = 0;
          let maxHeight = info.height;

          if (info.flex > 0) {
            // Flex 子元素：在主轴方向强制使用计算出的尺寸
            if (isRow) {
              minWidth = maxWidth = info.width;
            } else {
              minHeight = maxHeight = info.height;
            }
            // 在交叉轴方向，如果没有指定尺寸且 align="stretch"，也要强制拉伸
            if (isRow && info.element.height === undefined && align === "stretch") {
              minHeight = maxHeight = info.height;
            } else if (!isRow && info.element.width === undefined && align === "stretch") {
              minWidth = maxWidth = info.width;
            }
          } else {
            // 非 flex 元素：处理 stretch
            if (!isRow && info.element.width === undefined && align === "stretch") {
              minWidth = maxWidth = crossAxisSize - info.margin.left - info.margin.right;
            }
            if (isRow && info.element.height === undefined && align === "stretch") {
              minHeight = maxHeight = crossAxisSize - info.margin.top - info.margin.bottom;
            }
          }

          const childNode = computeLayout(
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

          node.children.push(childNode);

          // 更新主轴偏移
          mainOffset += isRow
            ? info.width + info.margin.left + info.margin.right
            : info.height + info.margin.top + info.margin.bottom;
          if (i < orderedInfos.length - 1) {
            mainOffset += mainGap;
          }
        }

        // 更新交叉轴偏移（移到下一行/列）
        crossOffset += lineCrossSize;
        // 行与行之间也应该有 gap（除了最后一行）
        if (lineIndex < lines.length - 1) {
          crossOffset += gap;
        }
      }

      // 如果是 reverse，需要反转 children 顺序以保持正确的渲染顺序
      if (isReverse) {
        node.children.reverse();
      }
    }
  }

  return node;
}
