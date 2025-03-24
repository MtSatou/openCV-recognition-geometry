import { lineTypeMap, PenTypeMap } from "../constant"
import { pointType } from "./cv.d";

export declare type lineType = `${lineTypeMap}`;
export declare type PenType = `${PenTypeMap}`;

export declare interface mouseUpHandlerCallbackType {
  /**鼠标事件对象 */
  // event: MouseEvent,
  /**点位数据 */
  data: pointType[],
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

export declare interface mouseMoveHandlerCallbackType {
  /**当前x坐标数据 */
  x: number,
  /**当前y坐标数据 */
  y: number,
  /**当前点位数据 */
  data: pointType[],
}

export declare interface canvasOptionsType {
  /**画笔颜色 */
  color: string;
  /**画笔粗细 */
  size: number;
  /**线段类型 */
  lineType: lineType
  /**笔类型 */
  penType: PenType
  /**鼠标抬起事件 */
  mouseUpHandler?: (event: mouseUpHandlerCallbackType | usingTypes) => void
  /**鼠标移动事件 */
  mouseMoveHandler?: (event: mouseMoveHandlerCallbackType) => void
}