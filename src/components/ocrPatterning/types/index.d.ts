import { shapeTypesMap } from "../constant"
export declare interface pointType {
  x: number;
  y: number;
}

export declare type shapeTypes = `${shapeTypesMap}`;

export declare interface usingTypes {
  type: shapeTypes;
  rect: { x: number; y: number; width: number; height: number };
  /**圆型率 */
  circularity: number;
  /**角度集合 */
  angles: number[];
  /**边长集合 */
  sides: number[];
  /**顶点集合 */
  vertices: pointType[];
}
