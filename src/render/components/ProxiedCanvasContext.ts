/**
 * ProxiedCanvasContext - Canvas 上下文代理类
 *
 * 该类提供对真实 CanvasRenderingContext2D 的代理，有以下功能：
 * 1. 管理 save/restore 的平衡（计数器）
 * 2. 追踪相对变换而不是绝对变换
 * 3. 在析构时自动恢复所有未恢复的状态
 * 4. 转发所有其他 Canvas API 调用
 */

import { DOMMatrix } from "@/compat/DOMMatrix";

export class ProxiedCanvasContext {
  /**
   * 真实的 Canvas 上下文
   */
  private ctx: CanvasRenderingContext2D;

  /**
   * 基础变换矩阵（初始化时设置，保持不变）
   */
  private baseTransform: DOMMatrix;

  /**
   * 相对变换矩阵（用户通过 setTransform 设置）
   */
  private relativeTransform: DOMMatrix;

  /**
   * save/restore 计数器
   */
  private saveCount: number = 0;

  /**
   * 构造函数
   * @param ctx 真实的 CanvasRenderingContext2D
   * @param baseTransform 初始的基础变换矩阵
   */
  constructor(ctx: CanvasRenderingContext2D, baseTransform: DOMMatrix) {
    this.ctx = ctx;
    this.baseTransform = baseTransform;
    // 初始化相对变换为单位矩阵
    this.relativeTransform = new DOMMatrix();
  }

  /**
   * save() - 保存当前状态并增加计数
   */
  save(): void {
    this.saveCount++;
    this.ctx.save();
  }

  /**
   * restore() - 恢复上一个状态并减少计数
   */
  restore(): void {
    if (this.saveCount > 0) {
      this.saveCount--;
      this.ctx.restore();
    }
  }

  /**
   * setTransform() - 设置相对变换
   */
  setTransform(...args: any[]): void {
    // 支持多种参数形式
    let matrix: DOMMatrix;

    if (args.length === 1 && args[0] instanceof DOMMatrix) {
      matrix = args[0];
    } else if (args.length === 6) {
      matrix = new DOMMatrix([args[0], args[1], args[2], args[3], args[4], args[5]]);
    } else {
      // 其他参数形式暂时不支持
      return;
    }

    // 保存相对变换
    this.relativeTransform = matrix;

    // 计算实际应用的变换：baseTransform ✕ relativeTransform
    const actualTransform = this.baseTransform.multiply(matrix);
    this.ctx.setTransform(actualTransform);
  }

  /**
   * getTransform() - 返回相对变换（而不是绝对变换）
   */
  getTransform(): DOMMatrix {
    return this.relativeTransform;
  }

  /**
   * 析构函数级的清理 - 自动恢复所有未恢复的 save
   */
  destroy(): void {
    while (this.saveCount > 0) {
      this.saveCount--;
      this.ctx.restore();
    }
  }

  /**
   * 代理所有其他 Canvas API 调用
   */
  [key: string]: any;
}

// 使用 Proxy 来转发所有其他方法调用
export function createProxiedCanvasContext(
  ctx: CanvasRenderingContext2D,
  baseTransform: DOMMatrix
): CanvasRenderingContext2D {
  const proxy = new ProxiedCanvasContext(ctx, baseTransform);

  return new Proxy(proxy as any, {
    get(target, prop: string | symbol, receiver) {
      // 处理自定义方法
      if (
        prop === "save" ||
        prop === "restore" ||
        prop === "setTransform" ||
        prop === "getTransform" ||
        prop === "destroy"
      ) {
        return Reflect.get(target, prop, receiver);
      }

      // 对于其他属性和方法，尝试从代理对象获取，否则从真实上下文获取
      const ownValue = Reflect.get(target, prop, receiver);
      if (ownValue !== undefined) {
        return ownValue;
      }

      // 从真实上下文中获取
      const contextValue = (target as any).ctx[prop];
      if (typeof contextValue === "function") {
        // 如果是方法，绑定到真实上下文
        return contextValue.bind((target as any).ctx);
      }
      return contextValue;
    },

    set(target, prop: string | symbol, value, _receiver) {
      // 所有属性设置都转发到真实上下文
      (target as any).ctx[prop] = value;
      return true;
    },

    has(target, prop) {
      if (
        prop === "save" ||
        prop === "restore" ||
        prop === "setTransform" ||
        prop === "getTransform" ||
        prop === "destroy"
      ) {
        return true;
      }
      return prop in (target as any).ctx;
    },

    ownKeys(target) {
      return Reflect.ownKeys((target as any).ctx);
    },

    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor((target as any).ctx, prop);
    },
  }) as unknown as CanvasRenderingContext2D;
}
