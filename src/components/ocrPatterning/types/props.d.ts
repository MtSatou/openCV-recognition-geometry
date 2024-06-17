import { canvasOptionsType } from "./theme"
export declare interface propsType {
  /**自动闭合 */
  alwaysClosed: boolean;
  /**线段显示角点 */
  showCornerPoint: boolean;
  /**画布宽度 */
  width: number | string;
  /**画布高度 */
  height: number | string;
  /**画布背景色 */
  fillColor: string;
  /**保留画布，默认true */
  reserve: boolean;
  /**canvas设置 */
  canvasOptions: canvasOptionsType;
} 