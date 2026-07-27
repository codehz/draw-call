import { describe, expect, test } from "bun:test";

import {
  groupFlexLines,
  lineCrossSize,
  lineMainSize,
  measureWrappedContentSize,
  resolveMainAxisPlacement,
} from "@/layout/utils/flex";

const zero = { top: 0, right: 0, bottom: 0, left: 0 };

describe("flex pure helpers", () => {
  test("groupFlexLines should wrap by main axis size", () => {
    const items = [
      { width: 40, height: 10, margin: zero },
      { width: 40, height: 10, margin: zero },
      { width: 40, height: 10, margin: zero },
    ];
    const lines = groupFlexLines(items, true, 10, 100, true);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveLength(2);
    expect(lines[1]).toHaveLength(1);
  });

  test("groupFlexLines without wrap keeps one line", () => {
    const items = [
      { width: 40, height: 10, margin: zero },
      { width: 40, height: 10, margin: zero },
    ];
    const lines = groupFlexLines(items, true, 0, 10, false);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveLength(2);
  });

  test("measureWrappedContentSize matches multi-line geometry", () => {
    const items = [
      { width: 50, height: 20, margin: zero },
      { width: 50, height: 20, margin: zero },
      { width: 50, height: 20, margin: zero },
    ];
    const size = measureWrappedContentSize(items, true, 10, 120);
    // 2 items first line (50+10+50=110), 1 item second line
    expect(size.width).toBe(110);
    expect(size.height).toBe(50);
  });

  test("resolveMainAxisPlacement space-between", () => {
    const { mainStart, mainGap } = resolveMainAxisPlacement("space-between", 100, 3, 0);
    expect(mainStart).toBe(0);
    expect(mainGap).toBe(50);
  });

  test("line sizes include gap and margin", () => {
    const items = [
      { width: 40, height: 10, margin: { top: 1, right: 2, bottom: 1, left: 2 } },
      { width: 20, height: 15, margin: zero },
    ];
    expect(lineMainSize(items, true, 5)).toBe(40 + 4 + 5 + 20);
    // cross = max(10+1+1, 15) = 15
    expect(lineCrossSize(items, true)).toBe(15);
  });
});
