import type { FontProps } from "../../types/base";

/**
 * 构建 Canvas 字体字符串
 * @param font 字体属性
 * @returns CSS 字体字符串
 */
export function buildFontString(font: FontProps): string {
  const style = font.style ?? "normal";
  const weight = font.weight ?? "normal";
  const size = font.size ?? 16;
  const family = font.family ?? "sans-serif";
  return `${style} ${weight} ${size}px ${family}`;
}
