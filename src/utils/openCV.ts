// @ts-expect-error
const cv = window.cv!;

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
  data: { x: number; y: number }[];
}

// 计算角度
function getContourAngles(contour: any): number[] {
  const angles: number[] = [];
  for (let i = 0; i < contour.rows; i++) {
    const point1 = new cv.Point(
      contour.data32S[i * 2],
      contour.data32S[i * 2 + 1]
    );
    const point2 = new cv.Point(
      contour.data32S[((i + 1) % contour.rows) * 2],
      contour.data32S[((i + 1) % contour.rows) * 2 + 1]
    );
    const point3 = new cv.Point(
      contour.data32S[((i + 2) % contour.rows) * 2],
      contour.data32S[((i + 2) % contour.rows) * 2 + 1]
    );

    const vector1 = new cv.Point(point1.x - point2.x, point1.y - point2.y);
    const vector2 = new cv.Point(point3.x - point2.x, point3.y - point2.y);

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(
      Math.pow(vector1.x, 2) + Math.pow(vector1.y, 2)
    );
    const magnitude2 = Math.sqrt(
      Math.pow(vector2.x, 2) + Math.pow(vector2.y, 2)
    );

    const cosine = dotProduct / (magnitude1 * magnitude2);
    const angle = Math.acos(cosine) * (180 / Math.PI);

    angles.push(angle);
  }
  return angles;
}

// 计算边长
function getContourSides(contour: any): { [key: string]: number } {
  const sides: { [key: string]: number } = {};
  for (let i = 0; i < contour.rows; i++) {
    const point1 = new cv.Point(
      contour.data32S[i * 2],
      contour.data32S[i * 2 + 1]
    );
    const point2 = new cv.Point(
      contour.data32S[((i + 1) % contour.rows) * 2],
      contour.data32S[((i + 1) % contour.rows) * 2 + 1]
    );

    const sideLength = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
    sides[`side${i + 1}`] = sideLength;
  }
  return sides;
}

// 判断形状
function recognizeShapesUsingFeatures(contour: any): usingTypes {
  const verticesCount = contour.rows;
  const area = cv.contourArea(contour);
  const perimeter = cv.arcLength(contour, true);
  const rect = cv.boundingRect(contour);
  const aspectRatio = rect.width / rect.height;
  const angles = getContourAngles(contour);
  const sides = getContourSides(contour);
  const circularity = (4 * Math.PI * area) / Math.pow(perimeter, 2); // 圆形的面积与周长比

  // 判断五角星辅助函数
  function isStarShape(contour: any): boolean {
    const vertices = getVerticesFromContour(contour);
    if (vertices.length !== 10) return false; // 五角星应该有10条边

    const angles = getContourAngles(contour);
    let countAcuteAngles = 0;
    for (const angle of angles) {
      if (angle < 80) {
        // 五角星有多个小角（角度小于75是正五角星，80是误差）
        countAcuteAngles++;
      }
    }

    return countAcuteAngles >= 5;
  }

  // 判断菱形辅助函数
  function isRhombus(angles: number[]): boolean {
    const [angle1, angle2, angle3, angle4] = angles;

    // 菱形的对角线上的两个角应该接近，且不靠近90度
    return (
      Math.abs(angle1 - angle3) < 15 &&
      Math.abs(angle2 - angle4) < 15 &&
      (angle1 < 80 || angle1 > 100) &&
      (angle3 < 80 || angle3 > 100)
    );
  }

  // 判断六边形辅助函数
  function isHexagon(angles: number[]) {
    let max = 0;
    for (const item of angles) {
      max += item;
    }
    return max > 700 && max < 740; // 五边形内角之和720度，如果大于700度则认定是六边形
  }

  // 判断五边形辅助函数
  function isPentagon(angles: number[]) {
    let max = 0;
    for (const item of angles) {
      max += item;
    }
    return max > 520 && max < 550; // 五边形内之和540度，如果大于520度则认定是六边形
  }

  // 判断形状类型
  if (verticesCount === 10 && isStarShape(contour)) {
    return {
      type: "五角星",
      data: getVerticesFromContour(contour),
    };
  } else if (verticesCount > 6) {
    // 边数大于6的情况下判断为圆形
    if (circularity > 0.7) {
      // 增加容错
      return {
        type: "圆形",
        data: getVerticesFromContour(contour),
      };
    } else {
      return {
        type: "未知",
        data: getVerticesFromContour(contour),
      };
    }
  } else if (verticesCount === 6 && isHexagon(angles)) {
    return {
      type: "六边形",
      data: getVerticesFromContour(contour),
    };
  } else if (verticesCount === 5 && isPentagon(angles)) {
    return {
      type: "五边形",
      data: getVerticesFromContour(contour),
    };
  } else if (verticesCount === 4) {
    const sideLengths = Object.values(sides);
    const avgSideLength =
      sideLengths.reduce((a, b) => a + b, 0) / sideLengths.length;
    const sideLengthDiff = Math.max(...sideLengths) - Math.min(...sideLengths);
    const angleDiffsFrom90 = angles.map((angle) => Math.abs(angle - 90));
    const maxAngleDiffFrom90 = Math.max(...angleDiffsFrom90);

    if (sideLengthDiff < avgSideLength * 0.2 && maxAngleDiffFrom90 < 15) {
      // 所有边长度接近且所有角接近90度
      return {
        type: "正方形",
        data: getVerticesFromContour(contour),
      };
    } else if (isRhombus(angles)) {
      // 两组对角接近45度或135度
      return {
        type: "菱形",
        data: getVerticesFromContour(contour),
      };
    } else {
      const maxSide = Math.max(...sideLengths);
      const minSide = Math.min(...sideLengths);
      const sideRatio = maxSide / minSide;

      // 检查角度是否接近直角
      const angleDiffsFrom90 = angles.map((angle) => Math.abs(angle - 90));
      const maxAngleDiffFrom90 = Math.max(...angleDiffsFrom90);

      if (maxAngleDiffFrom90 < 20) {
        // 角度接近直角，判断为矩形
        return {
          type: "矩形",
          data: getVerticesFromContour(contour),
        };
      } else if (sideRatio > 1.2) {
        // 边长差异较大，判断为梯形
        return {
          type: "梯形",
          data: getVerticesFromContour(contour),
        };
      } else {
        // 角度不完全接近90度，且边长差异不大，判断为菱形
        return {
          type: "菱形",
          data: getVerticesFromContour(contour),
        };
      }
    }
  } else if (verticesCount === 3) {
    return {
      type: "三角形",
      data: getVerticesFromContour(contour),
    };
  } else {
    return {
      type: "未知",
      data: getVerticesFromContour(contour),
    };
  }
}

// 计算顶点坐标
function getVerticesFromContour(contour: any): { x: number; y: number }[] {
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < contour.rows; i++) {
    vertices.push({
      x: contour.data32S[i * 2],
      y: contour.data32S[i * 2 + 1],
    });
  }
  return vertices;
}

// 获取圆心和半径
export function createCircleFromPoints(points: { x: number; y: number }[]): {
  center: { x: number; y: number };
  radius: number;
} {
  if (points.length === 0) {
    throw new Error("点数为空");
  }

  // 计算中心点
  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 }
  );

  const center = {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };

  // 计算半径（平均距离）
  const totalDistance = points.reduce((acc, point) => {
    const distance = Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
    );
    return acc + distance;
  }, 0);

  const radius = totalDistance / points.length;

  return { center, radius };
}

// 创建opencv解析图像
export function recognizeShapes(canvas: HTMLCanvasElement): usingTypes[] {
  // 获取 canvas 图像数据
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const src = cv.matFromImageData(imgData);
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  const blurred = new cv.Mat();
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
  const edges = new cv.Mat();
  cv.Canny(blurred, edges, 50, 150);

  // 查找轮廓
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
    edges,
    contours,
    hierarchy,
    cv.RETR_TREE,
    cv.CHAIN_APPROX_SIMPLE
  );

  const canvasVertices: usingTypes[] = [];
  // 遍历轮廓
  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const perimeter = cv.arcLength(contour, true);
    const approx = new cv.Mat();
    cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);
    const data = recognizeShapesUsingFeatures(approx);
    if (data) {
      canvasVertices.push(data);
    }
  }

  // 释放内存
  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();

  return canvasVertices;
}

/**检测图形是否闭合 */
export function isClosedShape(
  points: { x: number; y: number }[],
  threshold = 20
): boolean {
  if (points.length < 3) return false; // 至少需要三个点构成一个闭合图形
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  const dx = lastPoint.x - firstPoint.x;
  const dy = lastPoint.y - firstPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 判断距离是否小于阈值，则闭合
  return distance <= threshold;
}

/** 获取更合适的顶点数据 */
export function getMostFrequentShape(shapes: usingTypes[]): usingTypes | null {
  if (shapes.length === 0) return null;
  // 过滤未知的数据
  // shapes = shapes.filter((item) => item.type !== "未知");

  const typeCount: { [key: string]: number } = {};
  const typeData: { [key: string]: usingTypes } = {};

  shapes.forEach((shape) => {
    if (typeCount[shape.type]) {
      typeCount[shape.type]++;
    } else {
      typeCount[shape.type] = 1;
      typeData[shape.type] = shape;
    }
  });

  let mostFrequentType = "";
  let maxCount = 0;

  for (const type in typeCount) {
    if (typeCount[type] > maxCount) {
      maxCount = typeCount[type];
      mostFrequentType = type;
    }
  }

  return typeData[mostFrequentType] || null;
}
