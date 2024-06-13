// 绘制正基本图形
import { pointType } from "../types";

const config = {
  lineColor: "#690"
}

// 清空画布
export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height); 
}

// 绘制直线
export function drawLine(
  canvas: HTMLCanvasElement,
  pointA: pointType,
  pointB: pointType
) {
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  ctx.moveTo(pointA.x, pointA.y); // 移动到起点
  ctx.lineTo(pointB.x, pointB.y); // 画一条直线到终点
  ctx.strokeStyle = config.lineColor;
  ctx.stroke(); // 描边
}

// 画圆
export function drawCircle(
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  radius: number,
) {
  const ctx = canvas.getContext("2d")!;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = config.lineColor;
  ctx.stroke();
}

// 绘制顶点坐标图（多边形）
export function drawShapeOnCanvas(canvas: HTMLCanvasElement, shape: pointType[]) {
  if (!shape || !shape.length) return;

  const ctx = canvas.getContext("2d")!;

  ctx.beginPath();
  const startPoint = shape[0];
  ctx.moveTo(startPoint.x, startPoint.y);

  for (let i = 1; i < shape.length; i++) {
    const point = shape[i];
    ctx.lineTo(point.x, point.y);
  }

  ctx.lineTo(startPoint.x, startPoint.y);
  ctx.strokeStyle = config.lineColor;
  ctx.stroke();
}

// 绘制顶点坐标正方形
export function drawSquareFromPoints(canvas: HTMLCanvasElement, points: pointType[]) {
  const ctx = canvas.getContext("2d")!;
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
  ctx.strokeStyle = config.lineColor;
  ctx.stroke();
}

// 绘制顶点坐标矩形
export function drawRectangleFromPoints(canvas: HTMLCanvasElement, shape: pointType[]) {
  const ctx = canvas.getContext("2d")!;
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
  ctx.strokeStyle = config.lineColor;
  ctx.stroke();
}

// 绘制顶点坐标链接形状（未知图形 or 线）
export function drawShapeFromPoints(canvas: HTMLCanvasElement, points: pointType[], closePath: boolean = false){
  const ctx = canvas.getContext("2d")!;
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // 将每个顶点与下一个顶点相连
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  closePath && ctx.closePath();

  ctx.strokeStyle = config.lineColor;
  ctx.stroke(); // 绘制连接的直线
}
