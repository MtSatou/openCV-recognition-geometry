import type { brushOptions } from "../types/theme";
import HandwritingSelf from "./pen/Brush";

import type { pointType } from "../types/cv"
import type { propsType } from "../types/props"
import { shapeTypesMap, lineTypeMap } from "../constant/index"
import { ocr, isClosedShape, createCircleFromPoints, filterDensePoints } from "../utils/openCV"
import {
  clearCanvas,
  drawCircle,
  drawShapeOnCanvas,
  drawSquareFromPoints,
  drawRectangleFromPoints,
  drawShapeFromPoints
} from "../utils/draw"

export const defaultBrushOptions: brushOptions = {
  color: "#6699ee",
  size: 10,
  lineType: lineTypeMap.Line_Straight,
};

/**
 * 初始化画笔主题
 * @param ctx canvas2D上下文
 * @param options 画笔配置项
 */
export const initBrushTheme = (
  ctx: CanvasRenderingContext2D,
  options?: brushOptions
) => {
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
    //以下代码为鼠标移动事件部分
    let handwriting = new HandwritingSelf(ctx.canvas);
    ctx.canvas.addEventListener("mousedown", function (e: MouseEvent) {
      handwriting.clear();
      handwriting.down(e.x, e.y);
    });

    ctx.canvas.addEventListener("mousemove", function (e: MouseEvent) {
      handwriting.move(e.x, e.y);
    });

    ctx.canvas.addEventListener("mouseup", function (e: MouseEvent) {
      handwriting.up(e.x, e.y);
    });
  }
  // 激光笔
  else if (lineType === lineTypeMap.Pen_Laser) {
    ctx.setLineDash([]);
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
      // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#fff";
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
    };

    const canvas = ctx.canvas;
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
    requestAnimationFrame(drawLaserStroke);
  }
};

/**
 * 初始化画布状态
 * @param canvas canvas
 * @param props vue.props
 * @param emit vue.emit
 */
export const useTheme = (
  canvas: HTMLCanvasElement,
  props: propsType,
  emit: (event: "mousedown" | "mousemove" | "mouseup", ...args: any[]) => void
) => {
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

  let drawing = false;
  let points: pointType[] = [];
  canvas.addEventListener("mousedown", (event) => {
    drawing = true;
    points = [];
    emit("mousedown", {
      event,
    });
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    points.push({ x, y });
    draw();
    emit("mousedown", {
      event,
      rect,
      point: { x, y },
      points,
    });
  });

  canvas.addEventListener("mouseup", (event) => {
    drawing = false;
    // 只有智能笔才能识别
    if (defaultBrushOptions.lineType !== lineTypeMap.Pen_Smart) {
      return;
    }
    // 总是闭合
    if (props.alwaysClosed) {
      points.push(points[0]);
    }
    // 闭合图形
    if (isClosedShape(points)) {
      // openCV识别
      const mostFrequentShape = ocr(canvas);
      emit("mouseup", {
        event,
        ocr: mostFrequentShape,
        // 闭合
        isClosedShape: true,
      });

      if (!mostFrequentShape) {
        return;
      }

      // 未知图形直接获取所有顶点坐标以直线连接
      if (mostFrequentShape.type === shapeTypesMap.Unknown) {
        const corners = filterDensePoints(points);
        clearCanvas(canvas);
        drawShapeFromPoints(ctx, corners, true);
      }
      // 特殊处理：圆形
      else if (mostFrequentShape.type === shapeTypesMap.Circle) {
        const { center, radius } = createCircleFromPoints(
          mostFrequentShape.vertices
        );
        clearCanvas(canvas);
        drawCircle(ctx, center.x, center.y, radius);
      }
      // 特殊处理：矩形
      else if (mostFrequentShape?.type === shapeTypesMap.Rectangle) {
        clearCanvas(canvas);
        drawRectangleFromPoints(ctx, mostFrequentShape.vertices);
      }
      // 特殊处理：正方形
      else if (mostFrequentShape?.type === shapeTypesMap.Square) {
        clearCanvas(canvas);
        drawSquareFromPoints(ctx, mostFrequentShape.vertices);
      }
      // 特殊处理：五角星
      else if (mostFrequentShape?.type === shapeTypesMap.Star) {
        const corners = filterDensePoints(points);
        clearCanvas(canvas);
        drawShapeFromPoints(ctx, corners);
      } else {
        clearCanvas(canvas);
        drawShapeOnCanvas(ctx, mostFrequentShape.vertices);
      }
    } else {
      // 未闭合图形（线段）
      const corners = filterDensePoints(points);
      clearCanvas(canvas);
      drawShapeFromPoints(ctx, corners);
      emit("mouseup", {
        event,
        ocr: corners,
        // 未闭合
        isClosedShape: false,
      });
      // 显示角点
      if (props.showCornerPoint) {
        for (const c of corners) {
          drawCircle(ctx, c.x, c.y, 5);
        }
      }
    }
  });

  // 移动绘制
  function draw() {
    // 只有实现、虚线、智能笔通过这个方法绘制。其他笔有他对应的绘画逻辑
    const whiteArr = [
      lineTypeMap.Line_Straight,
      lineTypeMap.Line_broken,
      lineTypeMap.Pen_Smart,
    ];
    if (!whiteArr.includes(props.brushOptions.lineType as lineTypeMap)) {
      return;
    }
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    if (points.length === 0) return;
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
};

export default defaultBrushOptions;
