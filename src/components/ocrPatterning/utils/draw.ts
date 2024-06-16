// 绘制正基本图形
import { defaultCanvasOptions } from "../config";
import { pointType } from "../types/cv";

// 清空画布
export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = defaultCanvasOptions.fillColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height); 
}

// 绘制直线
export function drawLine(
  ctx: CanvasRenderingContext2D,
  pointA: pointType,
  pointB: pointType
) {
  
  ctx.beginPath();
  ctx.moveTo(pointA.x, pointA.y);
  ctx.lineTo(pointB.x, pointB.y); 
  ctx.stroke();
}

// 画圆
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

// 绘制顶点坐标图（多边形）
export function drawShapeOnCanvas(ctx: CanvasRenderingContext2D, shape: pointType[]) {
  if (!shape || !shape.length) return;

  ctx.beginPath();
  const startPoint = shape[0];
  ctx.moveTo(startPoint.x, startPoint.y);

  for (let i = 1; i < shape.length; i++) {
    const point = shape[i];
    ctx.lineTo(point.x, point.y);
  }

  ctx.lineTo(startPoint.x, startPoint.y);
  ctx.stroke();
}

// 绘制顶点坐标正方形
export function drawSquareFromPoints(ctx: CanvasRenderingContext2D, points: pointType[]) {
  
  if (points.length < 4) return;

  // 找到最小和最大 x 和 y 值
  const xValues = points.map(p => p.x);
  const yValues = points.map(p => p.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const side = Math.min(maxX - minX, maxY - minY);

  ctx.beginPath();
  ctx.rect(minX, minY, side, side);
  ctx.stroke();
}

// 绘制顶点坐标矩形
export function drawRectangleFromPoints(ctx: CanvasRenderingContext2D, shape: pointType[]) {
  
  if (shape.length < 4) return;

  // 找到最小和最大 x 和 y 值
  const xValues = shape.map((p) => p.x);
  const yValues = shape.map((p) => p.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const width = maxX - minX;
  const height = maxY - minY;

  ctx.beginPath();
  ctx.rect(minX, minY, width, height);
  ctx.stroke();
}

// 绘制顶点坐标链接形状（未知图形 or 线）
export function drawShapeFromPoints(ctx: CanvasRenderingContext2D, points: pointType[], closePath: boolean = false){
  
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // 将每个顶点与下一个顶点相连
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  closePath && ctx.closePath();

  ctx.stroke(); // 绘制连接的直线
}
