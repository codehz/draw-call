import type { BoxElement, BoxProps } from "@/types/components";

export function Box(props: BoxProps): BoxElement {
  return {
    type: "box",
    ...props,
  };
}
