export const DOMMatrix = typeof window !== "undefined" ? window.DOMMatrix : undefined;
export const Path2D = typeof window !== "undefined" ? window.Path2D : undefined;

export function createRawCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
