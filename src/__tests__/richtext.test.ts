import { describe, expect, test } from "bun:test";

import { Box, createCanvas, RichText } from "@/index";

describe("RichText", () => {
  test("should render rich text with multiple spans", () => {
    const canvas = createCanvas({ width: 400, height: 200 });
    canvas.render(
      Box({
        width: "fill",
        height: "fill",
        padding: 20,
        background: "#fff",
        children: [
          RichText({
            spans: [
              { text: "Hello ", color: "#333", font: { size: 20 } },
              { text: "World", color: "#ff0000", font: { size: 30, weight: "bold" } },
              { text: "!", color: "#333", font: { size: 20 } },
            ],
          }),
        ],
      })
    );
    expect(true).toBe(true);
  });

  test("should handle rich text wrapping", () => {
    const canvas = createCanvas({ width: 200, height: 200 });
    canvas.render(
      Box({
        width: "fill",
        height: "fill",
        padding: 20,
        background: "#fff",
        children: [
          RichText({
            spans: [
              { text: "This is a long piece of rich text that should wrap into multiple lines. ", color: "#333" },
              { text: "Red text here. ", color: "#f00", font: { weight: "bold" } },
              { text: "Blue text there.", color: "#00f", background: "#eee" },
            ],
          }),
        ],
      })
    );
    expect(true).toBe(true);
  });

  test("should handle rich text alignment", () => {
    const canvas = createCanvas({ width: 400, height: 300 });
    canvas.render(
      Box({
        width: "fill",
        height: "fill",
        direction: "column",
        gap: 20,
        children: [
          RichText({
            align: "left",
            spans: [{ text: "Left aligned rich text", color: "#333" }],
          }),
          RichText({
            align: "center",
            width: "fill",
            spans: [{ text: "Center aligned rich text", color: "#333" }],
          }),
          RichText({
            align: "right",
            width: "fill",
            spans: [{ text: "Right aligned rich text", color: "#333" }],
          }),
        ],
      })
    );
    expect(true).toBe(true);
  });

  test("should handle rich text decoration", () => {
    const canvas = createCanvas({ width: 400, height: 100 });
    canvas.render(
      RichText({
        spans: [
          { text: "Underline", underline: true, color: "#333" },
          { text: " " },
          { text: "Strikethrough", strikethrough: true, color: "#f00" },
        ],
      })
    );
    expect(true).toBe(true);
  });

  test("should handle maxLines and ellipsis", () => {
    const canvas = createCanvas({ width: 100, height: 100 });
    canvas.render(
      RichText({
        width: 100,
        maxLines: 1,
        ellipsis: true,
        spans: [{ text: "This is a very long text that should be truncated to one line", color: "#333" }],
      })
    );
    expect(true).toBe(true);
  });

  test("should expose richLines layout data", () => {
    const canvas = createCanvas({ width: 240, height: 120 });
    const node = canvas.render(
      RichText({
        width: 200,
        spans: [
          { text: "Hello ", color: "#333", font: { size: 16 } },
          { text: "World", color: "#f00", font: { size: 16, weight: "bold" } },
        ],
      })
    );

    expect(node.element.type).toBe("richtext");
    expect(node.richLines).toBeDefined();
    expect(node.richLines!.length).toBeGreaterThan(0);
    expect(node.richLines![0].segments.length).toBeGreaterThan(0);
    expect(node.richLines![0].width).toBeGreaterThan(0);
  });

  test("should clamp richLines by maxLines", () => {
    const canvas = createCanvas({ width: 100, height: 200 });
    const node = canvas.render(
      RichText({
        width: 80,
        maxLines: 2,
        spans: [
          {
            text: "This is a long rich text paragraph that should wrap into several lines for maxLines testing",
            color: "#333",
            font: { size: 14 },
          },
        ],
      })
    );

    expect(node.richLines).toBeDefined();
    expect(node.richLines!.length).toBeLessThanOrEqual(2);
  });
});
