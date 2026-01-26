import { wrapRichText } from "@/layout/components/richtext";
import type { MeasureContext } from "@/layout/utils/measure";
import type { RichTextElement, RichTextSpan } from "@/types/components";
import { describe, expect, test } from "bun:test";

/**
 * 创建一个简单的 mock MeasureContext 用于测试
 * 假设每个字符的宽度为 10px，高度为 20px
 */
function createMockMeasureContext(): MeasureContext {
  return {
    measureText(text: string, font) {
      const fontSize = font.size || 16;
      const height = fontSize * 1.2;
      return {
        width: text.length * 8,
        height: height,
        offset: height * 0.1,
        ascent: height * 0.75,
        descent: height * 0.25,
      };
    },
  };
}

describe("RichText Style Inheritance", () => {
  describe("span inherits element styles", () => {
    test("should inherit all styles from element when span has no styles", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 20, family: "Arial" },
        color: "#333333",
        background: "#eeeeee",
        underline: true,
        strikethrough: true,
      };

      const spans: RichTextSpan[] = [{ text: "Hello World", font: undefined, color: undefined, background: undefined }];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);

      expect(lines.length).toBe(1);
      const segments = lines[0].segments;
      expect(segments.length).toBeGreaterThan(0);

      // 验证所有 segment 继承了 element 的样式
      for (const segment of segments) {
        expect(segment.font.size).toBe(20);
        expect(segment.font.family).toBe("Arial");
        expect(segment.color).toBe("#333333");
        expect(segment.background).toBe("#eeeeee");
        expect(segment.underline).toBe(true);
        expect(segment.strikethrough).toBe(true);
      }
    });

    test("should inherit font and color from element", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 18, family: "Helvetica" },
        color: "#ff0000",
        background: undefined,
        underline: false,
        strikethrough: false,
      };

      const spans: RichTextSpan[] = [{ text: "Inherited", font: undefined, color: undefined }];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      for (const segment of segments) {
        expect(segment.font.size).toBe(18);
        expect(segment.font.family).toBe("Helvetica");
        expect(segment.color).toBe("#ff0000");
        expect(segment.underline).toBe(false);
        expect(segment.strikethrough).toBe(false);
      }
    });
  });

  describe("span overrides element styles", () => {
    test("should override all element styles with span styles", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 16, family: "Arial" },
        color: "#333333",
        background: "#cccccc",
        underline: false,
        strikethrough: false,
      };

      const spans: RichTextSpan[] = [
        {
          text: "Overridden",
          font: { size: 24, family: "Times New Roman" },
          color: "#0000ff",
          background: "#ffff00",
          underline: true,
          strikethrough: true,
        },
      ];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      for (const segment of segments) {
        expect(segment.font.size).toBe(24);
        expect(segment.font.family).toBe("Times New Roman");
        expect(segment.color).toBe("#0000ff");
        expect(segment.background).toBe("#ffff00");
        expect(segment.underline).toBe(true);
        expect(segment.strikethrough).toBe(true);
      }
    });

    test("should override only font from element", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 16, family: "Arial" },
        color: "#333333",
        background: "#eeeeee",
        underline: false,
        strikethrough: false,
      };

      const spans: RichTextSpan[] = [
        {
          text: "Bold",
          font: { size: 20, weight: "bold" },
          color: undefined,
          background: undefined,
        },
      ];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      for (const segment of segments) {
        expect(segment.font.size).toBe(20);
        expect(segment.font.weight).toBe("bold");
        expect(segment.color).toBe("#333333");
        expect(segment.background).toBe("#eeeeee");
        expect(segment.underline).toBe(false);
        expect(segment.strikethrough).toBe(false);
      }
    });

    test("should override only color from element", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 16, family: "Verdana" },
        color: "#333333",
        background: "#dddddd",
        underline: true,
        strikethrough: false,
      };

      const spans: RichTextSpan[] = [
        {
          text: "Red",
          font: undefined,
          color: "#ff0000",
          background: undefined,
        },
      ];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      for (const segment of segments) {
        expect(segment.font.size).toBe(16);
        expect(segment.font.family).toBe("Verdana");
        expect(segment.color).toBe("#ff0000");
        expect(segment.background).toBe("#dddddd");
        expect(segment.underline).toBe(true);
        expect(segment.strikethrough).toBe(false);
      }
    });
  });

  describe("mixed inheritance and override", () => {
    test("should inherit some styles and override others", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 18, family: "Georgia", weight: "normal" },
        color: "#333333",
        background: "#f0f0f0",
        underline: false,
        strikethrough: false,
      };

      const spans: RichTextSpan[] = [
        {
          text: "Mixed",
          font: { size: 22 }, // 只覆盖 size，继承 family 和 weight
          color: "#00ff00", // 覆盖 color
          background: undefined, // 继承 background
          underline: true, // 覆盖 underline，继承 strikethrough
        },
      ];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      for (const segment of segments) {
        // font: size 被覆盖，但 family 应该继承
        expect(segment.font.size).toBe(22);
        expect(segment.font.family).toBe("Georgia");
        expect(segment.font.weight).toBe("normal");
        // color 被覆盖
        expect(segment.color).toBe("#00ff00");
        // background 被继承
        expect(segment.background).toBe("#f0f0f0");
        // underline 被覆盖
        expect(segment.underline).toBe(true);
        // strikethrough 被继承
        expect(segment.strikethrough).toBe(false);
      }
    });

    test("should handle multiple spans with different override patterns", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 16, family: "Arial" },
        color: "#000000",
        background: "#ffffff",
        underline: false,
        strikethrough: false,
      };

      const spans: RichTextSpan[] = [
        { text: "Normal", font: undefined, color: undefined },
        { text: " Bold", font: { weight: "bold" }, color: "#ff0000" },
        { text: " Italic", font: { style: "italic" }, color: undefined },
      ];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      expect(segments.length).toBeGreaterThanOrEqual(3);

      // 第一个 span "Normal" - 完全继承
      expect(segments[0].color).toBe("#000000");
      expect(segments[0].font.size).toBe(16);
      expect(segments[0].font.family).toBe("Arial");

      // 寻找 "Bold" span 的 segments (应该是 space 之后)
      let boldSegmentIndex = -1;
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].text === "Bold") {
          boldSegmentIndex = i;
          break;
        }
      }
      expect(boldSegmentIndex).toBeGreaterThanOrEqual(0);

      // 验证 "Bold" segment 的样式 - 覆盖 weight 和 color
      const boldSegment = segments[boldSegmentIndex];
      expect(boldSegment.font.size).toBe(16); // 继承
      expect(boldSegment.font.weight).toBe("bold"); // 覆盖
      expect(boldSegment.color).toBe("#ff0000"); // 覆盖

      // 寻找 "Italic" span 的 segment
      let italicSegmentIndex = -1;
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].text === "Italic") {
          italicSegmentIndex = i;
          break;
        }
      }
      expect(italicSegmentIndex).toBeGreaterThanOrEqual(0);

      // 验证 "Italic" segment - 覆盖 style，继承 color
      const italicSegment = segments[italicSegmentIndex];
      expect(italicSegment.font.size).toBe(16); // 继承
      expect(italicSegment.font.style).toBe("italic"); // 覆盖
      expect(italicSegment.color).toBe("#000000"); // 继承
    });
  });

  describe("default values", () => {
    test("should use default values when neither element nor span specify styles", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: undefined,
        color: undefined,
        background: undefined,
        underline: undefined,
        strikethrough: undefined,
      };

      const spans: RichTextSpan[] = [{ text: "Default", font: undefined, color: undefined }];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      for (const segment of segments) {
        // 应该使用默认空对象作为 font
        expect(segment.font).toEqual({});
        // color 应该是 undefined
        expect(segment.color).toBeUndefined();
        // background 应该是 undefined
        expect(segment.background).toBeUndefined();
        // underline 应该是 false（默认值）
        expect(segment.underline).toBe(false);
        // strikethrough 应该是 false（默认值）
        expect(segment.strikethrough).toBe(false);
      }
    });

    test("should apply default values only to uncovered properties", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 14 },
        color: undefined,
        background: undefined,
        underline: undefined,
        strikethrough: undefined,
      };

      const spans: RichTextSpan[] = [
        {
          text: "Partial",
          font: undefined,
          color: "#ff0000",
          background: undefined,
        },
      ];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      for (const segment of segments) {
        // font 继承自 element
        expect(segment.font.size).toBe(14);
        // color 来自 span
        expect(segment.color).toBe("#ff0000");
        // background 使用默认值 undefined
        expect(segment.background).toBeUndefined();
        // 布尔值使用默认 false
        expect(segment.underline).toBe(false);
        expect(segment.strikethrough).toBe(false);
      }
    });

    test("should handle empty element styles", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {};

      const spans: RichTextSpan[] = [{ text: "Test", font: { size: 20 }, color: "#0000ff" }];

      const lines = wrapRichText(ctx, spans, 500, 1.2, element);
      const segments = lines[0].segments;

      for (const segment of segments) {
        expect(segment.font.size).toBe(20);
        expect(segment.color).toBe("#0000ff");
        expect(segment.background).toBeUndefined();
        expect(segment.underline).toBe(false);
        expect(segment.strikethrough).toBe(false);
      }
    });
  });

  describe("text wrapping with style preservation", () => {
    test("should preserve styles across line breaks", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 16, family: "Arial" },
        color: "#333333",
        background: undefined,
        underline: false,
        strikethrough: false,
      };

      const spans: RichTextSpan[] = [
        {
          text: "This is a very long text that should wrap across multiple lines when the width is limited",
          font: undefined,
          color: undefined,
        },
      ];

      const lines = wrapRichText(ctx, spans, 150, 1.2, element);

      // 应该有多行
      expect(lines.length).toBeGreaterThan(1);

      // 验证每一行的所有 segment 都有正确的样式
      for (const line of lines) {
        for (const segment of line.segments) {
          expect(segment.font.size).toBe(16);
          expect(segment.font.family).toBe("Arial");
          expect(segment.color).toBe("#333333");
          expect(segment.underline).toBe(false);
          expect(segment.strikethrough).toBe(false);
        }
      }
    });

    test("should preserve override styles across line breaks", () => {
      const ctx = createMockMeasureContext();
      const element: Pick<RichTextElement, "font" | "color" | "background" | "underline" | "strikethrough"> = {
        font: { size: 16 },
        color: "#000000",
        background: undefined,
        underline: false,
        strikethrough: false,
      };

      const spans: RichTextSpan[] = [
        {
          text: "This is a very long text with custom styles applied that should wrap across multiple lines",
          font: { size: 20, weight: "bold" },
          color: "#ff0000",
          background: "#ffff00",
          underline: true,
          strikethrough: false,
        },
      ];

      const lines = wrapRichText(ctx, spans, 150, 1.2, element);

      expect(lines.length).toBeGreaterThan(1);

      // 验证每一行的所有 segment 都有 span 覆盖的样式
      for (const line of lines) {
        for (const segment of line.segments) {
          expect(segment.font.size).toBe(20);
          expect(segment.font.weight).toBe("bold");
          expect(segment.color).toBe("#ff0000");
          expect(segment.background).toBe("#ffff00");
          expect(segment.underline).toBe(true);
        }
      }
    });
  });
});
