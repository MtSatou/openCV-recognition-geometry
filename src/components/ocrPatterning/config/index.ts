import type { brushOptions } from "../types/theme";
import { lineTypeMap, PenTypeMap } from "../constant/index"
export const defaultCanvasOptions: brushOptions = {
  color: "#6699ee",
  size: 10,
  lineType: lineTypeMap.Line_Straight,
  penType: PenTypeMap.Pencil,
  fillColor: "#00000000"
};