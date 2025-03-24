/**
 * 创建一次mousedown事件
 * @param element
 */
export function triggerMouseDown(element: HTMLElement) {
  const mouseMoveEvent = new MouseEvent("mousedown", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  mouseMoveEvent.isMe = true;
  element.dispatchEvent(mouseMoveEvent);
}

/**
 * 创建一次mousemove事件
 * @param element
 * @param x
 * @param y
 */
export function triggerMouseMove(element: HTMLElement, x: number, y: number) {
  const mouseMoveEvent = new MouseEvent("mousemove", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });

  mouseMoveEvent.isMe = true;
  element.dispatchEvent(mouseMoveEvent);
}

/**
 * 创建一次mouseup事件
 * @param element
 */
export function triggerMouseUp(element: HTMLElement) {
  const mouseMoveEvent = new MouseEvent("mouseup", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  mouseMoveEvent.isMe = true;
  element.dispatchEvent(mouseMoveEvent);
}
