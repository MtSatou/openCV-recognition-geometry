import { usingTypes, pointType } from "../types/cv";

// @ts-expect-error
const cv = window.cv!;

/**计算角度 */
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

/**计算边长 */
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

/**判断形状 */
function recognizeShapesUsingFeatures(contour: any): usingTypes {
  // 顶点数量
  const verticesCount = contour.rows;
  // 面积
  const area = cv.contourArea(contour);
  // 周长
  const perimeter = cv.arcLength(contour, true);
  // 形状坐标
  const rect = cv.boundingRect(contour);
  // 圆形率
  const circularity = (4 * Math.PI * area) / Math.pow(perimeter, 2);
  // 角度
  const angles = getContourAngles(contour);
  // 边长
  const sides = getContourSides(contour);
  const returns: usingTypes = {
    type: "未知",
    rect,
    angles,
    sides: Object.values(sides),
    vertices: getVerticesFromContour(contour),
    circularity,
  };

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
    return Object.assign(returns, {
      type: "五角星",
    });
  } else if (verticesCount > 6) {
    // 边数大于6的情况下判断为圆形
    if (circularity > 0.7) {
      // 增加容错
      return Object.assign(returns, {
        type: "圆形",
      });
    } else {
      return Object.assign(returns, {
        type: "未知",
      });
    }
  } else if (verticesCount === 6 && isHexagon(angles)) {
    return Object.assign(returns, {
      type: "六边形",
    });
  } else if (verticesCount === 5 && isPentagon(angles)) {
    return Object.assign(returns, {
      type: "五边形",
    });
  } else if (verticesCount === 4) {
    const sideLengths = Object.values(sides);
    const avgSideLength =
      sideLengths.reduce((a, b) => a + b, 0) / sideLengths.length;
    const sideLengthDiff = Math.max(...sideLengths) - Math.min(...sideLengths);
    const angleDiffsFrom90 = angles.map((angle) => Math.abs(angle - 90));
    const maxAngleDiffFrom90 = Math.max(...angleDiffsFrom90);

    if (sideLengthDiff < avgSideLength * 0.2 && maxAngleDiffFrom90 < 15) {
      // 所有边长度接近且所有角接近90度
      return Object.assign(returns, {
        type: "正方形",
      });
    } else if (isRhombus(angles)) {
      // 两组对角接近45度或135度
      return Object.assign(returns, {
        type: "菱形",
      });
    } else {
      const maxSide = Math.max(...sideLengths);
      const minSide = Math.min(...sideLengths);
      const sideRatio = maxSide / minSide;

      // 检查角度是否接近直角
      const angleDiffsFrom90 = angles.map((angle) => Math.abs(angle - 90));
      const maxAngleDiffFrom90 = Math.max(...angleDiffsFrom90);

      if (maxAngleDiffFrom90 < 20) {
        // 角度接近直角，判断为矩形
        return Object.assign(returns, {
          type: "矩形",
        });
      } else if (sideRatio > 1.2) {
        // 边长差异较大，判断为梯形
        return Object.assign(returns, {
          type: "梯形",
        });
      } else {
        // 角度不完全接近90度，且边长差异不大，判断为菱形
        return Object.assign(returns, {
          type: "菱形",
        });
      }
    }
  } else if (verticesCount === 3) {
    return Object.assign(returns, {
      type: "三角形",
    });
  } else {
    return Object.assign(returns, {
      type: "未知",
    });
  }
}

/**计算顶点坐标 */
function getVerticesFromContour(contour: any): pointType[] {
  const vertices: pointType[] = [];
  for (let i = 0; i < contour.rows; i++) {
    vertices.push({
      x: contour.data32S[i * 2],
      y: contour.data32S[i * 2 + 1],
    });
  }
  return vertices;
}

/**圆心和半径 */
export function createCircleFromPoints(points: pointType[]): {
  center: pointType;
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

/**opencv解析图像 */
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

  const canvasData: usingTypes[] = [];
  // 遍历轮廓
  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const perimeter = cv.arcLength(contour, true);
    const approx = new cv.Mat();
    cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);
    const data = recognizeShapesUsingFeatures(approx);
    if (data) {
      canvasData.push(data);
    }
  }

  // 释放内存
  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();

  return canvasData;
}

/**获取更合适的数据(出现次数最多) */
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

/**识别图形数据 */
export const ocr = (canvas: HTMLCanvasElement) => {
  const data = recognizeShapes(canvas);
  const shape = getMostFrequentShape(data);
  return shape;
};

/**检测图形是否闭合 */
export function isClosedShape(points: pointType[], threshold = 20): boolean {
  if (points.length < 3) return false; // 至少需要三个点构成一个闭合图形
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  const dx = lastPoint.x - firstPoint.x;
  const dy = lastPoint.y - firstPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 判断距离是否小于阈值，则闭合
  return distance <= threshold;
}

/**计算两个点之间的向量 */
export function calculateVector(p1: pointType, p2: pointType): [number, number] {
  return [p2.x - p1.x, p2.y - p1.y];
}

/**计算两个点之间的距离 */
export function calculateDistance(p1: pointType, p2: pointType): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**计算两个向量之间的夹角 */
export function calculateAngle(v1: [number, number], v2: [number, number]): number {
  const dotProduct = v1[0] * v2[0] + v1[1] * v2[1];
  const magnitude1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
  const magnitude2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);
  const cosTheta = dotProduct / (magnitude1 * magnitude2);
  const angle = Math.acos(cosTheta) * (180 / Math.PI);
  return angle;
}

/**
 * 取指定角度阈值的拐角点
 * @param points 坐标
 * @param angleThreshold 拐角判断阈值
 * @param minInterval 线段判断的间距
 * @returns
 */
export function findCorners(
  points: pointType[],
  angleThreshold: number = 10,
  minInterval: number = 1
): pointType[] {
  if (points.length < 3) {
    return [];
  }

  // 添加起点
  const corners: pointType[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const vector1 = calculateVector(points[i - 1], points[i]);
    const vector2 = calculateVector(points[i], points[i + 1]);
    const angle = calculateAngle(vector1, vector2);
    if (angle > angleThreshold) {
      // 确保距离上一个拐角点有足够的间隔
      if (
        i -
          (corners.length === 0
            ? 0
            : points.indexOf(corners[corners.length - 1])) >=
        minInterval
      ) {
        corners.push(points[i]);
      }
    }
  }
  // 终点
  corners.push(points[points.length - 1]);
  return corners;
}

/**
 * 过滤掉密集的点，密集地方只留下一个点
 * @param corners 角点数组
 * @param minDistance 最小间距
 * @param angleThreshold 拐角判断阈值 默认10
 * @param minInterval 线段判断的间距 默认1
 * @returns
 */
export function filterDensePoints(
  corners: pointType[],
  minDistance: number = 20,
  angleThreshold?: number
): pointType[] {
  if (corners.length < 2) {
    return corners;
  }
  corners = findCorners(corners, angleThreshold, minDistance);
  const filteredCorners: pointType[] = [corners[0]];
  for (let i = 1; i < corners.length; i++) {
    const lastCorner = filteredCorners[filteredCorners.length - 1];
    const currentCorner = corners[i];
    const distance = Math.sqrt(
      (currentCorner.x - lastCorner.x) ** 2 +
        (currentCorner.y - lastCorner.y) ** 2
    );
    if (distance >= minDistance) {
      filteredCorners.push(currentCorner);
    }
  }

  return filteredCorners;
}
