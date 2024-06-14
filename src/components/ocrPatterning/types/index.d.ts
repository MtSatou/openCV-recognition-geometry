export declare interface pointType {
  x: number;
  y: number;
}

export declare type shapeTypes =
  | "三角形"
  | "菱形"
  | "正方形"
  | "梯形"
  | "矩形"
  | "五边形"
  | "五角星"
  | "六边形"
  | "圆形"
  | "未知";
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
