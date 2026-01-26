import type { ImageElement, ImageProps } from "../types/components";

export function Image(props: ImageProps): ImageElement {
  return {
    type: "image",
    ...props,
  };
}
