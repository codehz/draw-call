import type { DOMMatrix } from "@/compat/DOMMatrix";
import { createProxiedCanvasContext } from "@/render/components/ProxiedCanvasContext";
import { renderNode } from "@/render/index";
import type { CustomDrawElement } from "@/types/components";
import type { LayoutNode } from "@/types/layout";

/**
 * 渲染 CustomDraw 组件
 * 提供自定义绘制回调，用户可以直接访问 Canvas 上下文并绘制自定义内容
 */
export function renderCustomDraw(ctx: CanvasRenderingContext2D, node: LayoutNode): void {
  const element = node.element as CustomDrawElement;

  // 保存起始的 Canvas 状态
  ctx.save();

  // 保存初始的 transform 矩阵
  const baseTransform = ctx.getTransform();

  // 创建 ProxiedCanvasContext 代理对象
  const proxyCtx = createProxiedCanvasContext(ctx, baseTransform as DOMMatrix);

  // 定义 inner 函数，当调用时，如果存在子元素，进行渲染
  const inner = () => {
    if (node.children && node.children.length > 0) {
      renderNode(ctx, node.children[0]);
    }
  };

  // 调用 element.draw() 方法并传递代理上下文和选项
  element.draw(proxyCtx, {
    inner,
    width: node.layout.contentWidth,
    height: node.layout.contentHeight,
  });

  // 调用代理对象的 destroy() 方法完成清理
  (proxyCtx as any).destroy();

  // 恢复 Canvas 状态
  ctx.restore();
}
