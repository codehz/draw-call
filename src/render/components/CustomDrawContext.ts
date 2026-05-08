import { DOMMatrix } from "@/compat";
import type { CustomDrawContext } from "@/types/components";

function cloneMatrix(matrix: DOMMatrix): DOMMatrix {
  return new DOMMatrix([matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f]);
}

function toRelativeMatrix(transform?: DOMMatrix | [number, number, number, number, number, number]): DOMMatrix {
  if (transform === undefined) {
    return new DOMMatrix();
  }

  if (transform instanceof DOMMatrix) {
    return cloneMatrix(transform);
  }

  return new DOMMatrix(transform);
}

export class ManagedCustomDrawContext implements CustomDrawContext {
  readonly canvas: CanvasRenderingContext2D;

  private readonly baseTransform: DOMMatrix;
  private relativeTransform: DOMMatrix;
  private readonly transformStack: DOMMatrix[] = [];
  private saveCount = 0;

  constructor(canvas: CanvasRenderingContext2D, baseTransform: DOMMatrix) {
    this.canvas = canvas;
    this.baseTransform = cloneMatrix(baseTransform);
    this.relativeTransform = new DOMMatrix();
  }

  save(): void {
    this.saveCount++;
    this.transformStack.push(cloneMatrix(this.relativeTransform));
    this.canvas.save();
  }

  restore(): void {
    if (this.saveCount === 0) {
      return;
    }

    this.saveCount--;
    this.relativeTransform = this.transformStack.pop() ?? new DOMMatrix();
    this.canvas.restore();
    this.applyRelativeTransform();
  }

  getTransform(): DOMMatrix {
    return cloneMatrix(this.relativeTransform);
  }

  setTransform(transform?: DOMMatrix | [number, number, number, number, number, number]): void {
    this.relativeTransform = toRelativeMatrix(transform);
    this.applyRelativeTransform();
  }

  resetTransform(): void {
    this.relativeTransform = new DOMMatrix();
    this.applyRelativeTransform();
  }

  translate(x: number, y: number): void {
    this.relativeTransform = this.relativeTransform.translate(x, y);
    this.applyRelativeTransform();
  }

  rotate(angle: number): void {
    this.relativeTransform = this.relativeTransform.rotate((angle * 180) / Math.PI);
    this.applyRelativeTransform();
  }

  scale(x: number, y?: number): void {
    this.relativeTransform = this.relativeTransform.scale(x, y ?? x);
    this.applyRelativeTransform();
  }

  transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.relativeTransform = this.relativeTransform.multiply(new DOMMatrix([a, b, c, d, e, f]));
    this.applyRelativeTransform();
  }

  destroy(): void {
    while (this.saveCount > 0) {
      this.restore();
    }
  }

  private applyRelativeTransform(): void {
    this.canvas.setTransform(this.baseTransform.multiply(this.relativeTransform));
  }
}

export function createCustomDrawContext(
  canvas: CanvasRenderingContext2D,
  baseTransform: DOMMatrix
): ManagedCustomDrawContext {
  return new ManagedCustomDrawContext(canvas, baseTransform);
}
