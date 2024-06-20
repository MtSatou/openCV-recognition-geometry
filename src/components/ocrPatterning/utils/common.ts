export function throttle(fn: (...args: any[]) => void, interval: number, options = { leading: true, trailing: false }) {
  const { leading, trailing } = options;
  let lastTime = 0;
  let timer: any = null;

  const _throttle = function (...args: any[]) {
    return new Promise((resolve, reject) => {
      const nowTime = new Date().getTime();
      if (!lastTime && !leading) lastTime = nowTime;

      const remainTime = interval - (nowTime - lastTime);
      if (remainTime <= 0) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }

        // @ts-expect-error
        const result = fn.apply(this, args);
        resolve(result);
        lastTime = nowTime;
        return;
      }

      if (trailing && !timer) {
        timer = setTimeout(() => {
          // @ts-expect-error
          const result = fn.apply(this, args);
          resolve(result);
          timer = null;
          lastTime = !leading ? 0 : new Date().getTime();
        }, remainTime);
      }
    });
  };

  _throttle.cancel = function () {
    if (timer) clearTimeout(timer);
    timer = null;
    lastTime = 0;
  };

  return _throttle;
}
