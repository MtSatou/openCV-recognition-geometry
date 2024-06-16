import type { brushOptions } from "../types/theme";
import { lineTypeMap, PenTypeMap } from "../constant/index"
export const defaultBrushOptions: brushOptions = {
  color: "#6699ee",
  size: 10,
  lineType: lineTypeMap.Line_Straight,
  PenType: PenTypeMap.Pencil
};