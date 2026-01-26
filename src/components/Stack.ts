import type { StackElement, StackProps } from "@/types/components";

export function Stack(props: StackProps): StackElement {
  return {
    type: "stack",
    ...props,
  };
}
