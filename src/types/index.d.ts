export interface pointType {
  x: number;
  y: number;
}

export interface usingTypes {
  type:
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
  data: pointType[];
}
