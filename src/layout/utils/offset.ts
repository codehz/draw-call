import type { LayoutNode } from "../engine";

/**
 * 递归地为布局节点及其子节点应用位置偏移
 */
export function applyOffset(node: LayoutNode, dx: number, dy: number): void {
  node.layout.x += dx;
  node.layout.y += dy;
  node.layout.contentX += dx;
  node.layout.contentY += dy;
  for (const child of node.children) {
    applyOffset(child, dx, dy);
  }
}
