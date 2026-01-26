import type { Element, TextElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";

/**
 * 获取元素类型的显示名称
 */
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
    case "svg":
      return "Svg";
    default:
      // @ts-expect-error: 未知类型兜底
      return element.type;
  }
}

/**
 * 递归打印布局树
 */
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
