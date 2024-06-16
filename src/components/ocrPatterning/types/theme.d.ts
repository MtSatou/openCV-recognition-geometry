import { lineTypeMap, PenTypeMap } from "../constant"

export declare type lineType = `${lineTypeMap}`;
export declare type PenType = `${PenTypeMap}`;

export declare interface canvasOptionsType {
  /**画笔颜色 */
  color?: string;
  /**画笔粗细 */
  size?: number;
  /**线段类型 */
  lineType?: lineType
  /**笔类型 */
  penType?: PenType
  /**画布背景色 */
  fillColor: string
}