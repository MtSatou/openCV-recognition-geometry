// 绘制正基本图形
import { defaultCanvasOptions } from "../config";
import { pointType } from "../types/cv";

// 清空画布
export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  radius: number
) {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

// 绘制顶点坐标图（多边形）
export function drawShapeOnCanvas(
  ctx: CanvasRenderingContext2D,
  shape: pointType[]
) {
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
export function drawSquareFromPoints(
  ctx: CanvasRenderingContext2D,
  points: pointType[]
) {
  if (points.length < 4) return;

  // 找到最小和最大 x 和 y 值
  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);
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
export function drawRectangleFromPoints(
  ctx: CanvasRenderingContext2D,
  shape: pointType[]
) {
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
export function drawShapeFromPoints(
  ctx: CanvasRenderingContext2D,
  points: pointType[],
  closePath: boolean = false
) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // 将每个顶点与下一个顶点相连
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  closePath && ctx.closePath();

  ctx.stroke();
}

/**获取转换后的canvas画布颜色 */
export const getCanvasImgRgbaData = (ctx: CanvasRenderingContext2D): { r: number, g: number, b: number, a: number }[] => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const pixels: { r: number, g: number, b: number, a: number }[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    pixels.push({ r, g, b, a });
  }

  return pixels;
};

/**设置canvas画布颜色 */
export const setCanvasImgRgbaData = (
  fromCtx: CanvasRenderingContext2D,
  toCtx: CanvasRenderingContext2D,
) => {
  const fromCtxData = fromCtx.getImageData(0, 0, fromCtx.canvas.width, fromCtx.canvas.height)
  const toCtxData = toCtx.getImageData(0, 0, toCtx.canvas.width, toCtx.canvas.height);

  const fromData = fromCtxData.data;
  const toData = toCtxData.data;

  const arrayLength = toCtxData.width * toCtxData.height * 4;
  const mergedData = new Uint8ClampedArray(arrayLength);

  for (let i = 0; i < arrayLength; i += 4) {
    const fromAlpha = fromData[i + 3];      // A

    if (fromAlpha !== 0) {
      mergedData[i] = fromData[i];          // R
      mergedData[i + 1] = fromData[i + 1];  // G
      mergedData[i + 2] = fromData[i + 2];  // B
      mergedData[i + 3] = fromAlpha;        // A
    } else {
      mergedData[i] = toData[i];            // R
      mergedData[i + 1] = toData[i + 1];    // G
      mergedData[i + 2] = toData[i + 2];    // B
      mergedData[i + 3] = toData[i + 3];    // A
    }
  }
  const mergeImageData = new ImageData(mergedData, toCtxData.width, toCtxData.height);
  // 将合并后的图像数据绘制回目标画布
  toCtx.putImageData(mergeImageData, 0, 0);
  return mergeImageData;
};
