import { brushOptions } from "../types/theme"
import { lineTypeMap } from "../constant"

export const defaultBrushOptions: brushOptions = {
  color: "#6699ee",
  size: 10,
  lineType: lineTypeMap.Brush_Pen
};

/**
 * 初始化画笔主题
 * @param ctx canvas2D上下文
 * @param options 画笔配置项
 */
export const initBrushTheme = (ctx: CanvasRenderingContext2D, options?: brushOptions) => {
  const { color, size, lineType } = { ...defaultBrushOptions, ...options };
  ctx.strokeStyle = color!;
  ctx.lineWidth = size!;
  // 虚线
  if (lineType === lineTypeMap.Line_broken) {
    // 设置虚线的模式，画5空5
    ctx.setLineDash([20, 5]);
  } 
  // 毛笔刷
  else if (lineType === lineTypeMap.Brush_Pen) {
    // 创建一个径向渐变，从中心到边缘透明度衰减
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size! / 2);
    gradient.addColorStop(0, color!);
    gradient.addColorStop(1, `${color}00`); // 末尾的 '00' 表示全透明

    ctx.strokeStyle = gradient;
    ctx.fillStyle = gradient;
    ctx.setLineDash([]); // 清除任何线段模式
  } 
  // 实线
  else {
    ctx.setLineDash([]);
  }
}

export default defaultBrushOptions;
