import type { NormalizedSpacing } from "../types/base";
import { normalizeSpacing } from "../types/base";
import type { Element, TextElement } from "../types/components";
import type { ComputedLayout, LayoutConstraints } from "../types/layout";
import { resolveSize, sizeNeedsParent } from "../types/layout";
import type { MeasureContext } from "./measure";
import { truncateText, wrapText } from "./measure";

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

// 计算元素的固有尺寸（不依赖父容器的尺寸）
function measureIntrinsicSize(
  element: Element,
  ctx: MeasureContext,
  availableWidth: number
): { width: number; height: number } {
  switch (element.type) {
    case "text": {
      const font = element.font ?? {};
      const fontSize = font.size ?? 16;
      const lineHeight = element.lineHeight ?? 1.2;
      const lineHeightPx = fontSize * lineHeight;

      // 如果设置了 wrap 且有可用宽度，进行换行计算
      if (element.wrap && availableWidth > 0 && availableWidth < Infinity) {
        const { lines } = wrapText(ctx, element.content, availableWidth, font);
        const { width: maxLineWidth } = lines.reduce(
          (max, line) => {
            const { width } = ctx.measureText(line, font);
            return width > max.width ? { width } : max;
          },
          { width: 0 }
        );
        return {
          width: maxLineWidth,
          height: lines.length * lineHeightPx,
        };
      }

      // 不换行时测量整行
      const { width, height } = ctx.measureText(element.content, font);
      return { width, height: Math.max(height, lineHeightPx) };
    }

    case "box": {
      // Box: Flex 布局
      const padding = normalizeSpacing(element.padding);
      const gap = element.gap ?? 0;
      const direction = element.direction ?? "row";
      const isRow = direction === "row" || direction === "row-reverse";

      let contentWidth = 0;
      let contentHeight = 0;

      const children = element.children ?? [];

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childMargin = normalizeSpacing(child.margin);
        const childSize = measureIntrinsicSize(
          child,
          ctx,
          availableWidth - padding.left - padding.right - childMargin.left - childMargin.right
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

      // 如果明确设置了数值尺寸，优先使用
      const intrinsicWidth = contentWidth + padding.left + padding.right;
      const intrinsicHeight = contentHeight + padding.top + padding.bottom;

      return {
        width: typeof element.width === "number" ? element.width : intrinsicWidth,
        height: typeof element.height === "number" ? element.height : intrinsicHeight,
      };
    }

    case "stack": {
      // Stack: 子元素重叠，取最大值
      const padding = normalizeSpacing(element.padding);

      let contentWidth = 0;
      let contentHeight = 0;

      const children = element.children ?? [];

      for (const child of children) {
        const childMargin = normalizeSpacing(child.margin);
        const childSize = measureIntrinsicSize(
          child,
          ctx,
          availableWidth - padding.left - padding.right - childMargin.left - childMargin.right
        );
        contentWidth = Math.max(contentWidth, childSize.width + childMargin.left + childMargin.right);
        contentHeight = Math.max(contentHeight, childSize.height + childMargin.top + childMargin.bottom);
      }

      // 如果明确设置了数值尺寸，优先使用
      const intrinsicWidth = contentWidth + padding.left + padding.right;
      const intrinsicHeight = contentHeight + padding.top + padding.bottom;

      return {
        width: typeof element.width === "number" ? element.width : intrinsicWidth,
        height: typeof element.height === "number" ? element.height : intrinsicHeight,
      };
    }

    case "image": {
      // 图片使用指定尺寸或默认值
      return { width: 0, height: 0 };
    }

    case "shape": {
      return { width: 0, height: 0 };
    }

    default:
      return { width: 0, height: 0 };
  }
}

// 递归地为布局节点及其子节点应用位置偏移
function applyOffset(node: LayoutNode, dx: number, dy: number): void {
  node.layout.x += dx;
  node.layout.y += dy;
  node.layout.contentX += dx;
  node.layout.contentY += dy;
  for (const child of node.children) {
    applyOffset(child, dx, dy);
  }
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

      let totalFixed = 0;
      let totalFlex = 0;
      let totalGap = children.length > 1 ? gap * (children.length - 1) : 0;

      for (const child of children) {
        const childMargin = normalizeSpacing(child.margin);
        const childFlex = child.flex ?? 0;

        if (childFlex > 0) {
          totalFlex += childFlex;
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

          // 应用 stretch
          if (shouldStretchWidth) {
            w = contentWidth - childMargin.left - childMargin.right;
          }
          if (shouldStretchHeight) {
            h = contentHeight - childMargin.top - childMargin.bottom;
          }

          if (isRow) {
            totalFixed += w + childMargin.left + childMargin.right;
          } else {
            totalFixed += h + childMargin.top + childMargin.bottom;
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

      // 计算 flex 元素的尺寸
      const availableForFlex = isRow
        ? Math.max(0, contentWidth - totalFixed - totalGap)
        : Math.max(0, contentHeight - totalFixed - totalGap);

      for (const info of childInfos) {
        if (info.flex > 0) {
          const flexSize = (availableForFlex * info.flex) / totalFlex;
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

      // 计算主轴起始位置和间距
      const totalSize =
        childInfos.reduce((sum, info) => {
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
          if (children.length > 1) {
            mainGap = gap + freeSpace / (children.length - 1);
          }
          break;
        case "space-around":
          if (children.length > 0) {
            const spacing = freeSpace / children.length;
            mainStart = spacing / 2;
            mainGap = gap + spacing;
          }
          break;
        case "space-evenly":
          if (children.length > 0) {
            const spacing = freeSpace / (children.length + 1);
            mainStart = spacing;
            mainGap = gap + spacing;
          }
          break;
      }

      // 布局子元素
      let mainOffset = mainStart;
      const orderedInfos = isReverse ? [...childInfos].reverse() : childInfos;

      for (let i = 0; i < orderedInfos.length; i++) {
        const info = orderedInfos[i];
        const crossAxisSize = isRow ? contentHeight : contentWidth;
        const childCrossSize = isRow
          ? info.height + info.margin.top + info.margin.bottom
          : info.width + info.margin.left + info.margin.right;

        // 计算交叉轴位置
        let crossOffset = 0;
        const effectiveAlign =
          info.element.alignSelf === "auto" || info.element.alignSelf === undefined ? align : info.element.alignSelf;

        switch (effectiveAlign) {
          case "start":
            crossOffset = 0;
            break;
          case "end":
            crossOffset = crossAxisSize - childCrossSize;
            break;
          case "center":
            crossOffset = (crossAxisSize - childCrossSize) / 2;
            break;
          case "stretch":
            crossOffset = 0;
            if (isRow && info.element.height === undefined) {
              info.height = crossAxisSize - info.margin.top - info.margin.bottom;
            } else if (!isRow && info.element.width === undefined) {
              info.width = crossAxisSize - info.margin.left - info.margin.right;
            }
            break;
          case "baseline":
            // TODO: 实现 baseline 对齐
            crossOffset = 0;
            break;
        }

        const childX = isRow ? contentX + mainOffset + info.margin.left : contentX + crossOffset + info.margin.left;
        const childY = isRow ? contentY + crossOffset + info.margin.top : contentY + mainOffset + info.margin.top;

        // 处理 stretch 对约束的影响
        const stretchWidth =
          !isRow && info.element.width === undefined && align === "stretch"
            ? contentWidth - info.margin.left - info.margin.right
            : null;
        const stretchHeight =
          isRow && info.element.height === undefined && align === "stretch"
            ? contentHeight - info.margin.top - info.margin.bottom
            : null;

        const childNode = computeLayout(
          info.element,
          ctx,
          {
            minWidth: stretchWidth ?? 0,
            maxWidth: stretchWidth ?? info.width,
            minHeight: stretchHeight ?? 0,
            maxHeight: stretchHeight ?? info.height,
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

      // 如果是 reverse，需要反转 children 顺序以保持正确的渲染顺序
      if (isReverse) {
        node.children.reverse();
      }
    }
  }

  return node;
}
// 获取元素类型的显示名称
function getElementType(element: Element): string {
  switch (element.type) {
    case "box":
      return "Box";
    case "text":
      return `Text "${(element as TextElement).content.slice(0, 20)}${(element as TextElement).content.length > 20 ? "..." : ""}"`;
    case "stack":
      return "Stack";
    case "image":
      return "Image";
    case "shape":
      return "Shape";
    default:
      // @ts-expect-error: 未知类型兜底
      return element.type;
  }
}

// 递归打印布局树
function printLayoutToString(
  node: LayoutNode,
  prefix: string = "",
  isLast: boolean = true,
  depth: number = 0
): string[] {
  const lines: string[] = [];
  const connector = isLast ? "└─ " : "├─ ";
  const type = getElementType(node.element);
  const { x, y, width, height } = node.layout;
  const childCount = node.children.length;

  // 第一行：元素类型和位置尺寸
  lines.push(
    `${prefix}${connector}${type} @(${Math.round(x)},${Math.round(y)}) size:${Math.round(width)}x${Math.round(height)}`
  );

  // 如果是文本，显示内容行
  if (node.element.type === "text" && node.lines) {
    const contentPrefix = prefix + (isLast ? "    " : "│   ");
    for (let i = 0; i < node.lines.length; i++) {
      const lineText = node.lines[i];
      const isLastLine = i === node.lines.length - 1 && childCount === 0;
      lines.push(`${contentPrefix}${isLastLine ? "└─ " : "├─ "}${JSON.stringify(lineText)}`);
    }
  }

  // 递归打印子元素
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const isChildLast = i === node.children.length - 1;
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    lines.push(...printLayoutToString(child, childPrefix, isChildLast, depth + 1));
  }

  return lines;
}

/**
 * 打印 LayoutNode 树结构到控制台
 * @param node LayoutNode 根节点
 */
export function printLayout(node: LayoutNode): void {
  const lines = printLayoutToString(node, "", true);
  console.log(lines.join("\n"));
}

/**
 * 将 LayoutNode 转换为美观的字符串
 * @param node LayoutNode 根节点
 * @param indent 缩进字符串，默认为两个空格
 * @returns 格式化的字符串
 */
export function layoutToString(node: LayoutNode, _indent: string = "  "): string {
  const lines = printLayoutToString(node, "", true);
  return lines.join("\n");
}
