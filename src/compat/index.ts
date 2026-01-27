import { createCanvas } from "@napi-rs/canvas";

export { DOMMatrix, Path2D } from "@napi-rs/canvas";

export function createRawCanvas(width: number, height: number) {
  return createCanvas(width, height) as unknown as HTMLCanvasElement;
}
