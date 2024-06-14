import { lineTypeMap } from "../constant"

export declare type lineType = `${lineTypeMap}`;

export declare interface brushOptions {
  /**画笔颜色 */
  color: string;
  /**画笔粗细 */
  size: number;
  /**线段类型 */
  lineType: lineType
}