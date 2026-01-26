import type { CustomDrawElement, CustomDrawProps } from "@/types/components";

export function CustomDraw(props: CustomDrawProps): CustomDrawElement {
  return {
    type: "customdraw",
    ...props,
  };
}
