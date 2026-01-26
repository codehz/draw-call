import type { RichTextElement, RichTextProps } from "@/types/components";

export function RichText(props: RichTextProps): RichTextElement {
  return {
    type: "richtext",
    ...props,
  };
}
