import type { brushOptions } from "../types/theme"
import { lineTypeMap } from "../constant"

export const defaultBrushOptions: brushOptions = {
  color: "#6699ee",
  size: 10,
  lineType: lineTypeMap.Line_Straight
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
  // 实线
  if (lineType === lineTypeMap.Line_Straight) {
    ctx.setLineDash([]);
  } 
  // 虚线
  else if (lineType === lineTypeMap.Line_broken) {
    // 设置虚线的模式，画20空5
    ctx.setLineDash([20, 5]);
  }
  // 毛笔
  else if (lineType === lineTypeMap.Pen_Brush) {
    
  } 
  // 激光笔
  else if (lineType === lineTypeMap.Pen_Laser) {
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let isDrawing = false;
    let points: {
      alpha: number
      size: number
      color: string
      x: number
      y: number
    }[] = [];

    const drawLaserStroke = () => {
      // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, canvas.width, canvas.height); 

      ctx.beginPath();
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        ctx.globalAlpha = point.alpha;
        ctx.lineWidth = point.size;
        ctx.strokeStyle = point.color;

        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.stroke();
      ctx.globalAlpha = 1;

      // 每个点透明度逐渐降低，并保留透明度>0的数据
      points = points.map(point => ({
        ...point,
        alpha: point.alpha - 0.03
      })).filter(point => point.alpha > 0);

      requestAnimationFrame(drawLaserStroke);
    };

    const startDrawing = (event: MouseEvent) => {
      isDrawing = true;
      points.push({
        x: event.clientX,
        y: event.clientY,
        alpha: 1,
        size: size!,
        color: color!
      });
    };

    const draw = (event: MouseEvent) => {
      if (!isDrawing) return;
      points.push({
        x: event.clientX,
        y: event.clientY,
        alpha: 1,
        size: size!,
        color: color!
      });
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    const canvas = ctx.canvas;
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    requestAnimationFrame(drawLaserStroke);    
  }
}

export default defaultBrushOptions;
