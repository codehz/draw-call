import type { TextElement, TextProps } from "../types/components";

export function Text(props: TextProps): TextElement {
  return {
    type: "text",
    ...props,
  };
}
