// 绘制正基本图形
import { pointType } from "../types";


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
  ctx.stroke(); // 描边
}

// 绘制三角形
export function drawTriangle(
  canvas: HTMLCanvasElement,
  vertices: { x: number; y: number }[],
  color: string
) {
  const ctx = canvas.getContext("2d")!;
  // 开始绘制三角形路径
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y); // 移动到第一个顶点
  ctx.lineTo(vertices[1].x, vertices[1].y); // 绘制到第二个顶点
  ctx.lineTo(vertices[2].x, vertices[2].y); // 绘制到第三个顶点
  ctx.closePath(); // 封闭路径
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
}

// 绘制正方形
export function drawSquare(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  sideLength: number,
  color: string
) {
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  ctx.rect(x, y, sideLength, sideLength);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

// 绘制矩形
export function drawRectangle(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

// 绘制菱形
export function drawDiamond(
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  color: string
) {
  const ctx = canvas.getContext("2d")!;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY - halfHeight);
  ctx.lineTo(centerX + halfWidth, centerY);
  ctx.lineTo(centerX, centerY + halfHeight);
  ctx.lineTo(centerX - halfWidth, centerY);
  ctx.closePath();

  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
}

// 绘制梯形
export function drawTrapezoid(
  canvas: HTMLCanvasElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
  color: string
) {
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  ctx.moveTo(x1, y1); // 左上角顶点
  ctx.lineTo(x2, y2); // 右上顶点
  ctx.lineTo(x3, y3); // 右下角顶点
  ctx.lineTo(x4, y4); // 左下顶点
  ctx.closePath();

  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
}

// 绘制正五边形
export function drawPentagon(
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  radius: number,
  color: string
) {
  const numberOfSides = 5;
  const step = (2 * Math.PI) / numberOfSides;
  const shift = Math.PI / 10;

  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  for (let i = 0; i <= numberOfSides; i++) {
    const x = centerX + radius * Math.cos(i * step - shift);
    const y = centerY + radius * Math.sin(i * step - shift);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();

  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
}

// 绘制正6边形
export function drawHexagon(
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  radius: number,
  color: string
) {
  const numberOfSides = 6;
  const step = (2 * Math.PI) / numberOfSides;
  const shift = Math.PI / 6;
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  for (let i = 0; i <= numberOfSides; i++) {
    const x = centerX + radius * Math.cos(i * step - shift);
    const y = centerY + radius * Math.sin(i * step - shift);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();

  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
}

// 五角星
export function drawStar(
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  points: number,
  color: string
) {
  const angleStep = Math.PI / points;
  let angle = Math.PI / 2;
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  for (let i = 0; i <= 2 * points; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    angle += angleStep;
  }
  ctx.closePath();

  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
}

// 画圆
export function drawCircle(
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  radius: number,
  color: string
) {
  const ctx = canvas.getContext("2d")!;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
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
  ctx.strokeStyle = 'black';
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
  ctx.strokeStyle = "black";
  ctx.stroke();
}

// 绘制顶点坐标链接形状（未知图形 or 线）
export function drawShapeFromPoints(canvas: HTMLCanvasElement, points: pointType[], closePath: boolean = false){
  const ctx = canvas.getContext("2d")!;
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y); // 将画笔移动到第一个顶点

  // 将每个顶点与下一个顶点相连
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  closePath && ctx.closePath();

  ctx.strokeStyle = "black";
  ctx.stroke(); // 绘制连接的直线
}
