import type { NormalizedSpacing } from "@/types/base";
import type { FlexDirection } from "@/types/layout";

export interface AxisConfig {
  isRow: boolean;
  isReverse: boolean;
}

export function createAxisConfig(direction: FlexDirection = "row"): AxisConfig {
  return {
    isRow: direction === "row" || direction === "row-reverse",
    isReverse: direction === "row-reverse" || direction === "column-reverse",
  };
}

export function mainSize(isRow: boolean, width: number, height: number): number {
  return isRow ? width : height;
}

export function crossSize(isRow: boolean, width: number, height: number): number {
  return isRow ? height : width;
}

export function mainMargin(isRow: boolean, margin: NormalizedSpacing): number {
  return isRow ? margin.left + margin.right : margin.top + margin.bottom;
}

export function crossMargin(isRow: boolean, margin: NormalizedSpacing): number {
  return isRow ? margin.top + margin.bottom : margin.left + margin.right;
}

export function outerMainSize(isRow: boolean, width: number, height: number, margin: NormalizedSpacing): number {
  return mainSize(isRow, width, height) + mainMargin(isRow, margin);
}

export function outerCrossSize(isRow: boolean, width: number, height: number, margin: NormalizedSpacing): number {
  return crossSize(isRow, width, height) + crossMargin(isRow, margin);
}
