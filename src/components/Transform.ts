import type { TransformElement, TransformProps } from "@/types/components";

export function Transform(props: TransformProps): TransformElement {
  return {
    type: "transform",
    ...props,
  };
}
