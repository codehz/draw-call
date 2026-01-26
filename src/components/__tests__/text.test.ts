import { Text } from "@/index";
import { describe, expect, test } from "bun:test";

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
});
