import type {
  SvgCircleChild,
  SvgElement,
  SvgEllipseChild,
  SvgGroupChild,
  SvgLineChild,
  SvgPathChild,
  SvgPolygonChild,
  SvgPolylineChild,
  SvgProps,
  SvgRectChild,
  SvgTextChild,
} from "@/types/components";

export function Svg(props: SvgProps): SvgElement {
  return {
    type: "svg",
    ...props,
  };
}

// 便捷的图形原语工厂函数
export const svg = {
  rect: (props: Omit<SvgRectChild, "type">): SvgRectChild => ({
    type: "rect",
    ...props,
  }),
  circle: (props: Omit<SvgCircleChild, "type">): SvgCircleChild => ({
    type: "circle",
    ...props,
  }),
  ellipse: (props: Omit<SvgEllipseChild, "type">): SvgEllipseChild => ({
    type: "ellipse",
    ...props,
  }),
  line: (props: Omit<SvgLineChild, "type">): SvgLineChild => ({
    type: "line",
    ...props,
  }),
  polyline: (props: Omit<SvgPolylineChild, "type">): SvgPolylineChild => ({
    type: "polyline",
    ...props,
  }),
  polygon: (props: Omit<SvgPolygonChild, "type">): SvgPolygonChild => ({
    type: "polygon",
    ...props,
  }),
  path: (props: Omit<SvgPathChild, "type">): SvgPathChild => ({
    type: "path",
    ...props,
  }),
  text: (props: Omit<SvgTextChild, "type">): SvgTextChild => ({
    type: "text",
    ...props,
  }),
  g: (props: Omit<SvgGroupChild, "type">): SvgGroupChild => ({
    type: "g",
    ...props,
  }),
};
