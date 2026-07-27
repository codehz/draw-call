import { describe, expect, test } from "bun:test";

import { Box, createCanvas, Text } from "@/index";

describe("Text component", () => {
  test("should create text element", () => {
    const text = Text({
      content: "Hello World",
      font: { size: 16, family: "Arial" },
      color: "#333",
    });
    expect(text.type).toBe("text");
    expect(text.content).toBe("Hello World");
    expect(text.font?.size).toBe(16);
  });

  test("should produce lines and lineOffsets without wrap", () => {
    const canvas = createCanvas({ width: 200, height: 80 });
    const node = canvas.render(
      Text({
        content: "Hello",
        font: { size: 16 },
        color: "#111",
      })
    );

    expect(node.element.type).toBe("text");
    expect(node.lines).toEqual(["Hello"]);
    expect(node.lineOffsets).toBeDefined();
    expect(node.lineOffsets).toHaveLength(1);
  });

  test("should wrap text into multiple lines", () => {
    const canvas = createCanvas({ width: 120, height: 200 });
    const node = canvas.render(
      Box({
        width: 80,
        children: [
          Text({
            content: "one two three four five",
            wrap: true,
            font: { size: 14 },
            color: "#111",
          }),
        ],
      })
    );

    const textNode = node.children[0];
    expect(textNode.lines).toBeDefined();
    expect(textNode.lines!.length).toBeGreaterThan(1);
    expect(textNode.lineOffsets).toHaveLength(textNode.lines!.length);
  });

  test("should clamp wrapped lines with maxLines", () => {
    const canvas = createCanvas({ width: 120, height: 200 });
    const node = canvas.render(
      Text({
        width: 60,
        content: "one two three four five six seven",
        wrap: true,
        maxLines: 1,
        ellipsis: true,
        font: { size: 16 },
        color: "#111",
      })
    );

    expect(node.lines).toHaveLength(1);
    expect(node.lines![0].length).toBeGreaterThan(0);
  });

  test("should truncate non-wrap text with ellipsis", () => {
    const canvas = createCanvas({ width: 120, height: 80 });
    const node = canvas.render(
      Text({
        width: 40,
        content: "abcdefghijklmnop",
        ellipsis: true,
        font: { size: 16 },
        color: "#111",
      })
    );

    expect(node.lines).toHaveLength(1);
    expect(node.lines![0].endsWith("...")).toBe(true);
  });
});
