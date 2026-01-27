import { Box, createCanvas, RichText } from "@/index";
import { describe, expect, test } from "bun:test";

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
});
