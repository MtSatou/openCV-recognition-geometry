// 笔（笔锋）
import { defaultCanvasOptions } from "../../config"
interface Point {
  x: number;
  y: number;
  isControl: boolean;
  time: number;
  lineWidth: number;
  isAdd: boolean;
}

class Point implements Point {
  constructor(x: number, y: number, time?: number) {
    this.x = x;
    this.y = y;
    this.isControl = false;
    this.time = time ?? Date.now();
    this.lineWidth = defaultCanvasOptions.size as number;
    this.isAdd = false;
  }
}

interface Line {
  points: Point[];
  changeWidthCount: number;
  lineWidth: number;
}

class Line implements Line {
  constructor() {
    this.points = new Array();
    this.changeWidthCount = 0;
    this.lineWidth = defaultCanvasOptions.size as number;
  }
}

export class HandwritingSelf {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  line: Line;
  pointLines: Line[];
  k: number;
  begin: Point | null;
  middle: Point | null;
  end: Point | null;
  preTime: number | null;
  lineWidth: number;
  isDown: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.line = new Line();
    this.pointLines = new Array();
    this.k = 0.5;
    this.begin = null;
    this.middle = null;
    this.end = null;
    this.preTime = null;
    this.lineWidth = defaultCanvasOptions.size as number;
    this.isDown = false;
  }

  down(x: number, y: number) {
    this.isDown = true;
    this.line = new Line();
    this.line.lineWidth = defaultCanvasOptions.size as number;
    let currentPoint = new Point(x, y, Date.now());
    this.addPoint(currentPoint);

    this.preTime = Date.now();
  }

  move(x: number, y: number) {
    if (this.isDown) {
      let currentPoint = new Point(x, y, Date.now());
      this.addPoint(currentPoint);
      this.draw();
    }
  }

  up(x: number, y: number) {
    let currentPoint = new Point(x, y, Date.now());
    this.addPoint(currentPoint);
    this.draw(true);

    this.pointLines.push(this.line);

    this.begin = null;
    this.middle = null;
    this.end = null;
    this.isDown = false;
  }

  draw(isUp: boolean = false) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.pointLines.forEach((line) => {
      let points = line.points;
      this.ctx.beginPath();
      this.ctx.ellipse(
        points[0].x - 1.5,
        points[0].y,
        6,
        3,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      let lastW = line.lineWidth;
      this.ctx.lineWidth = line.lineWidth;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      let minLineW = line.lineWidth / 4;
      let isChangeW = false;

      let changeWidthCount = line.changeWidthCount;
      for (let i = 1; i <= points.length; i++) {
        if (i == points.length) {
          this.ctx.stroke();
          break;
        }
        if (i > points.length - changeWidthCount) {
          if (!isChangeW) {
            this.ctx.stroke();
            isChangeW = true;
            if (i > 1 && points[i - 1].isControl) continue;
          }
          let w =
            ((lastW - minLineW) / changeWidthCount) * (points.length - i) +
            minLineW;
          points[i - 1].lineWidth = w;
          this.ctx.beginPath();
          this.ctx.lineWidth = w;
          this.ctx.moveTo(points[i - 1].x, points[i - 1].y);
          this.ctx.lineTo(points[i].x, points[i].y);
          this.ctx.stroke();
        } else {
          if (points[i].isControl && points[i + 1]) {
            this.ctx.quadraticCurveTo(
              points[i].x,
              points[i].y,
              points[i + 1].x,
              points[i + 1].y
            );
          } else if (i >= 1 && points[i - 1].isControl) {
          } else this.ctx.lineTo(points[i].x, points[i].y);
        }
      }
    });

    let points;
    if (isUp) points = this.line.points;
    else points = [].concat(this.line.points as []);

    let count = 0;
    let insertCount = 0;
    let i = points.length - 1;
    let endPoint = points[i];
    let controlPoint;
    let startPoint;
    while (i >= 0) {
      if (points[i].isControl == true) {
        controlPoint = points[i];
        count++;
      } else {
        startPoint = points[i];
      }
      if (startPoint && controlPoint && endPoint) {
        let dis =
          this.z_distance(startPoint, controlPoint) +
          this.z_distance(controlPoint, endPoint);
        let insertPoints = this.BezierCalculate(
          [startPoint, controlPoint, endPoint],
          Math.floor(dis / 6) + 1
        );
        insertCount += insertPoints.length;
        var index = i;
        // @ts-expect-error
        insertPoints.unshift(index, 1);
        // @ts-expect-error
        Array.prototype.splice.apply(points, insertPoints);

        endPoint = startPoint;
        startPoint = null;
      }
      if (count >= 6) break;
      i--;
    }

    let changeWidthCount = count + insertCount;
    if (isUp) this.line.changeWidthCount = changeWidthCount;

    this.ctx.beginPath();
    this.ctx.ellipse(
      points[0].x - 1.5,
      points[0].y,
      6,
      3,
      Math.PI / 4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    let lastW = this.line.lineWidth;
    this.ctx.lineWidth = this.line.lineWidth;
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    let minLineW = this.line.lineWidth / 4;
    let isChangeW = false;
    for (let i = 1; i <= points.length; i++) {
      if (i == points.length) {
        this.ctx.stroke();
        break;
      }
      if (i > points.length - changeWidthCount) {
        if (!isChangeW) {
          this.ctx.stroke();
          isChangeW = true;
          if (i > 1 && points[i - 1].isControl) continue;
        }

        let w =
          ((lastW - minLineW) / changeWidthCount) * (points.length - i) +
          minLineW;
        points[i - 1].lineWidth = w;
        this.ctx.beginPath();
        this.ctx.lineWidth = w;
        this.ctx.moveTo(points[i - 1].x, points[i - 1].y);
        this.ctx.lineTo(points[i].x, points[i].y);
        this.ctx.stroke();
      } else {
        if (points[i].isControl && points[i + 1]) {
          this.ctx.quadraticCurveTo(
            points[i].x,
            points[i].y,
            points[i + 1].x,
            points[i + 1].y
          );
        } else if (i >= 1 && points[i - 1].isControl) {
        } else this.ctx.lineTo(points[i].x, points[i].y);
      }
    }
  }

  addPoint(p: Point) {
    if (this.line.points.length >= 1) {
      let last_point = this.line.points[this.line.points.length - 1];
      let distance = this.z_distance(p, last_point);
      if (distance < 10) {
        return;
      }
    }

    if (this.line.points.length == 0) {
      this.begin = p;
      p.isControl = true;
      this.pushPoint(p);
    } else {
      this.middle = p;
      let controlPs = this.computeControlPoints(
        this.k,
        this.begin!,
        this.middle,
        null
      )!;
      this.pushPoint(controlPs.first);
      this.pushPoint(p);
      p.isControl = true;

      this.begin = this.middle;
    }
  }

  pushPoint(p: Point) {
    if (
      this.line.points.length >= 1 &&
      this.line.points[this.line.points.length - 1].x == p.x &&
      this.line.points[this.line.points.length - 1].y == p.y
    )
      return;
    this.line.points.push(p);
  }

  computeControlPoints(k: number, begin: Point, middle: Point, end: Point | null) {
    if (k > 0.5 || k <= 0) return;

    let diff1 = new Point(middle.x - begin.x, middle.y - begin.y);
    let diff2 = null;
    if (end) diff2 = new Point(end.x - middle.x, end.y - middle.y);

    let first = new Point(middle.x - k * diff1.x, middle.y - k * diff1.y);
    let second = null;
    if (diff2)
      second = new Point(middle.x + k * diff2.x, middle.y + k * diff2.y);
    return { first: first, second: second };
  }

  z_distance(b: Point, e: Point) {
    return Math.sqrt(Math.pow(e.x - b.x, 2) + Math.pow(e.y - b.y, 2));
  }

  BezierCalculate(poss: Point[], precision: number): Point[] {
    let dimersion = 2;
    let number = poss.length;
    if (number < 2 || dimersion < 2) return [];

    let result: Point[] = [];

    let mi = new Array();
    mi[0] = mi[1] = 1;
    for (let i = 3; i <= number; i++) {
      let t = new Array();
      for (let j = 0; j < i - 1; j++) {
        t[j] = mi[j];
      }

      mi[0] = mi[i - 1] = 1;
      for (let j = 0; j < i - 2; j++) {
        mi[j + 1] = t[j] + t[j + 1];
      }
    }

    for (let i = 0; i < precision; i++) {
      let t = i / precision;
      let p = new Point(0, 0, Date.now());
      p.isAdd = true;
      result.push(p);
      for (let j = 0; j < dimersion; j++) {
        let temp = 0.0;
        for (let k = 0; k < number; k++) {
          temp +=
            Math.pow(1 - t, number - k - 1) *
            (j == 0 ? poss[k].x : poss[k].y) *
            Math.pow(t, k) *
            mi[k];
        }
        j == 0 ? (p.x = temp) : (p.y = temp);
      }
    }

    return result;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.pointLines = [];
    this.line = new Line();
    this.begin = null;
    this.middle = null;
    this.end = null;
    this.isDown = false;
  }
}
