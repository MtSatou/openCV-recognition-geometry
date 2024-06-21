import type { pointType } from "../types/cv";
import type { propsType } from "../types/props";
import type { canvasOptionsType, lineType, PenType } from "../types/theme";
import { defaultCanvasOptions } from "../config";
import { shapeTypesMap, lineTypeMap, PenTypeMap } from "../constant/index";
import {
  ocr,
  isClosedShape,
  createCircleFromPoints,
  filterDensePoints,
} from "../utils/openCV";
import {
  clearCanvas,
  drawCircle,
  drawShapeOnCanvas,
  drawSquareFromPoints,
  drawRectangleFromPoints,
  drawShapeFromPoints
} from "../utils/draw";
import { HandwritingSelf } from "./pen";

// 移动绘制
function draw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  points: pointType[],
  props: propsType
) {
  // 只有实现、虚线、智能笔通过这个方法绘制。其他笔有他对应的绘画逻辑
  const whiteArr = [
    lineTypeMap.Line_Straight,
    lineTypeMap.Line_broken,
    PenTypeMap.Pen_Smart,
  ];
  if (!whiteArr.includes(props.canvasOptions.lineType as lineTypeMap)) {
    return;
  }
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  if (points.length === 0) return;
  ctx.lineWidth = defaultCanvasOptions.size as number;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  // 总是闭合
  if (props.alwaysClosed) {
    ctx.lineTo(points[0].x, points[0].y);
  }
  ctx.stroke();
}

export interface callbackType {
  /**鼠标事件对象 */
  // event: MouseEvent,
  /**点位数据 */
  // data: any,
  /**源图像像素数据 */
  // pixels: ImageData,
  /**转换后图像像素数据 */
  // canvasImageData: { r: number, g: number, b: number, a: number }[],
  penData: {
    /**笔类型 */
    penType: PenType,
    /**笔颜色 */
    color: string,
    /**笔大小 */
    size: number,
    /**线类型 */
    lineType: lineType,
  }
}

/**
 * 初始化画笔主题
 * @param ctx canvas2D上下文
 * @param options 画笔配置项
 */
export const initTheme = (
  ctx: CanvasRenderingContext2D,
  props: propsType,
  options?: canvasOptionsType,
  cb?: (event: callbackType) => void
) => {
  const { color, size, lineType, penType } = {
    ...defaultCanvasOptions,
    ...options,
  };

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

  // 铅笔（常规笔）
  if (penType === PenTypeMap.Pencil) {
    let drawing = false;
    let points: pointType[] = [];
    ctx.canvas.onmousedown = () => {
      drawing = true;
      points = [];
    };
    ctx.canvas.onmousemove = (event) => {
      if (!drawing) return;
      const rect = ctx.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      points.push({ x, y });
      draw(ctx, ctx.canvas, points, props);
    };
    ctx.canvas.onmouseup = () => {
      drawing = false;
      cb && cb({
        // event,
        // data: points,
        // pixels: ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
        // canvasImageData: getCanvasImgRgbaData(ctx),
        penData: {
          penType,
          lineType,
          size,
          color
        }
      })
    }
  }
  // 毛笔
  else if (penType === PenTypeMap.Pen_Brush) {
    let handwriting = new HandwritingSelf(ctx.canvas);
    ctx.canvas.onmousedown = function (event: MouseEvent) {
      handwriting.clear();
      handwriting.down(event.x, event.y);
    };

    ctx.canvas.onmousemove = function (event: MouseEvent) {
      handwriting.move(event.x, event.y);
    };

    ctx.canvas.onmouseup = function (event: MouseEvent) {
      handwriting.up(event.x, event.y);
      cb && cb({
        // event,
        // data: [],
        // pixels: ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
        // canvasImageData: getCanvasImgRgbaData(ctx),
        penData: {
          penType,
          lineType,
          size,
          color
        }
      })
    };
  }
  // 激光笔
  else if (penType === PenTypeMap.Pen_Laser) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let isDrawing = false;
    let points: {
      alpha: number;
      size: number;
      color: string;
      x: number;
      y: number;
    }[] = [];

    const drawLaserStroke = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
      points = points
        .map((point) => ({
          ...point,
          alpha: point.alpha - 0.03,
        }))
        .filter((point) => point.alpha > 0);

      requestAnimationFrame(drawLaserStroke);
    };

    const startDrawing = (event: MouseEvent) => {
      isDrawing = true;
      points.push({
        x: event.clientX,
        y: event.clientY,
        alpha: 1,
        size: size!,
        color: color!,
      });
    };

    const draw = (event: MouseEvent) => {
      if (!isDrawing) return;
      points.push({
        x: event.clientX,
        y: event.clientY,
        alpha: 1,
        size: size!,
        color: color!,
      });
    };

    const stopDrawing = () => {
      isDrawing = false;
      cb && cb({
        // event,
        // data: [],
        // pixels: ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
        // canvasImageData: getCanvasImgRgbaData(ctx),
        penData: {
          penType,
          lineType,
          size,
          color
        }
      })
    };

    const canvas = ctx.canvas;
    canvas.onmousedown = startDrawing;
    canvas.onmousemove = draw;
    canvas.onmouseup = stopDrawing;
    canvas.onmouseout = stopDrawing;
    requestAnimationFrame(drawLaserStroke);
  }
  // 智能笔
  else if (penType === PenTypeMap.Pen_Smart) {
    let drawing = false;
    let points: pointType[] = [];
    ctx.canvas.onmousedown = () => {
      drawing = true;
      points = [];
    };

    ctx.canvas.onmousemove = (event: MouseEvent) => {
      if (!drawing) return;
      const rect = ctx.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      points.push({ x, y });
      draw(ctx, ctx.canvas, points, props);
    };
    ctx.canvas.onmouseup = () => {
      drawing = false;
      // 总是闭合
      if (props.alwaysClosed) {
        points.push(points[0]);
      }
      // 闭合图形
      if (isClosedShape(points)) {
        // openCV识别
        const mostFrequentShape = ocr(ctx.canvas);
        clearCanvas(ctx.canvas);
        if (!mostFrequentShape) {
          return;
        }
        // 未知图形直接获取所有顶点坐标以直线连接
        if (mostFrequentShape.type === shapeTypesMap.Unknown) {
          const corners = filterDensePoints(points);
          drawShapeFromPoints(ctx, corners, true);
        }
        // 特殊处理：圆形
        else if (mostFrequentShape.type === shapeTypesMap.Circle) {
          const { center, radius } = createCircleFromPoints(
            mostFrequentShape.vertices
          );
          drawCircle(ctx, center.x, center.y, radius);
        }
        // 特殊处理：矩形
        else if (mostFrequentShape?.type === shapeTypesMap.Rectangle) {
          drawRectangleFromPoints(ctx, mostFrequentShape.vertices);
        }
        // 特殊处理：正方形
        else if (mostFrequentShape?.type === shapeTypesMap.Square) {
          drawSquareFromPoints(ctx, mostFrequentShape.vertices);
        }
        // 特殊处理：五角星
        else if (mostFrequentShape?.type === shapeTypesMap.Star) {
          const corners = filterDensePoints(points);
          drawShapeFromPoints(ctx, corners);
        } else {
          drawShapeOnCanvas(ctx, mostFrequentShape.vertices);
        }
        
        cb && cb({
          // event,
          // data: mostFrequentShape,
          // pixels: ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
          // canvasImageData: getCanvasImgRgbaData(ctx),
          penData: {
            penType,
            lineType,
            size,
            color
          }
        })
      } 
      // 未闭合图形（线段）
      else {
        const corners = filterDensePoints(points);
        clearCanvas(ctx.canvas)
        drawShapeFromPoints(ctx, corners);

        cb && cb({
          // event,
          // data: corners,
          // pixels: ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
          // canvasImageData: getCanvasImgRgbaData(ctx),
          penData: {
            penType,
            lineType,
            size,
            color
          }
        });
        // 显示角点
        if (props.showCornerPoint) {
          for (const c of corners) {
            drawCircle(ctx, c.x, c.y, 5);
          }
        }
      }
      clearCanvas(ctx.canvas)
    };
  }
};
