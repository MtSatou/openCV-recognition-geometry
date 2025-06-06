import type { canvasOptionsType, pointType, propsType, lineType, PenType } from "../types/index.d";
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

/**
 * 初始化画笔主题
 * @param ctx canvas2D上下文
 * @param options 画笔配置项
 */
export const initTheme = (
  ctx: CanvasRenderingContext2D,
  props: propsType,
  options: canvasOptionsType
) => {
  let drawing = false;
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
      options.mouseMoveHandler && options.mouseMoveHandler({
        x, 
        y, 
        data: points
      })
    };
    ctx.canvas.onmouseup = () => {
      drawing = false;
      options.mouseUpHandler && options.mouseUpHandler({
        // event,
        data: filterDensePoints(points, 2, 2), // 过滤密集点 稍微影响精度 数据量大概下降 60%
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
    let points: pointType[] = [];
    let handwriting = new HandwritingSelf(ctx.canvas);
    ctx.canvas.onmousedown = function (event: MouseEvent) {
      drawing = true
      points = [];
      handwriting.clear();
      handwriting.down(event.x, event.y);
    };

    ctx.canvas.onmousemove = function (event: MouseEvent) {
      if (!drawing) return;
      points.push({ x: event.x, y: event.y });
      handwriting.move(event.x, event.y);
      options.mouseMoveHandler && options.mouseMoveHandler({
        x: event.x, 
        y: event.y, 
        data: points
      })
    };

    ctx.canvas.onmouseup = function (event: MouseEvent) {
      drawing = false
      handwriting.up(event.x, event.y);
      options.mouseUpHandler && options.mouseUpHandler({
        // event,
        data: points,
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

    let points: {
      alpha: number;
      size: number;
      color: string;
      x: number;
      y: number;
    }[] = [];

    const drawLaserStroke = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (let i = 0; i < points.length - 1; i++) {
        const startPoint = points[i];
        const endPoint = points[i + 1];
        ctx.beginPath();
        ctx.globalAlpha = startPoint.alpha;
        ctx.lineWidth = startPoint.size;
        ctx.strokeStyle = startPoint.color;
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }

      // 每个点透明度逐渐降低，并保留透明度>0的数据
      points = points
      .map(point => ({
        ...point,
        alpha: Math.max(point.alpha - 0.04, 0)
      }))
      .filter(point => point.alpha > 0);

      requestAnimationFrame(drawLaserStroke);
    };

    const startDrawing = (event: MouseEvent) => {
      drawing = true
      points.push({
        x: event.clientX,
        y: event.clientY,
        alpha: 1,
        size: size!,
        color: color!,
      });
    };

    const draw = (event: MouseEvent) => {
      if (!drawing) return;
      points.push({
        x: event.clientX,
        y: event.clientY,
        alpha: 1,
        size: size!,
        color: color!,
      });
      options.mouseMoveHandler && options.mouseMoveHandler({
        x: event.x, 
        y: event.y, 
        data: points
      })
    };

    const stopDrawing = () => {
      drawing = false;
      options.mouseUpHandler && options.mouseUpHandler({
        // event,
        data: points,
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
      options.mouseMoveHandler && options.mouseMoveHandler({
        x: event.x, 
        y: event.y, 
        data: points
      })
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
        
        options.mouseUpHandler && options.mouseUpHandler({
          // event,
          data: mostFrequentShape,
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

        options.mouseUpHandler && options.mouseUpHandler({
          // event,
          data: corners,
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
