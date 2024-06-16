import type { canvasOptionsType } from "../types/theme";
import { lineTypeMap, PenTypeMap } from "../constant/index"
export const defaultCanvasOptions: canvasOptionsType = {
  color: "#6699ee",
  size: 10,
  lineType: lineTypeMap.Line_Straight,
  penType: PenTypeMap.Pencil,
  fillColor: "#00000000"
};