import type { StackProps, StackElement } from "../types/components";

export function Stack(props: StackProps): StackElement {
  return {
    type: "stack",
    ...props,
  };
}
