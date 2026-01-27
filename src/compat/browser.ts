export const DOMMatrix = window.DOMMatrix;
export const Path2D = window.Path2D;

export function createRawCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
