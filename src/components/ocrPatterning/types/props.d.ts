import { brushOptions } from "./theme"
export declare interface propsType {
  /**自动闭合 */
  alwaysClosed: boolean;
  /**线段显示角点 */
  showCornerPoint: boolean;
  /**禁用识别 */
  disableIdentification: boolean;
  /**画布宽度 */
  width: number | string;
  /**画布高度 */
  height: number | string;
  /**画笔设置 */
  brushOptions: brushOptions
} 