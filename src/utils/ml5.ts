/* 
  用法：
     const { imgClassify } = await patterningOcr({
       init() {
         console.log("初始化");
       },
       load() {
         console.log("加载中");
       },
       done() {
         console.log("模型加载完毕");
       }
     });
     setInterval(() => {
       imgClassify(canvas, (err: any, result: any[]) => {
           console.log(err, result, "识别结果")
         })
     }, 1000);
*/

// @ts-expect-error
import ml5 from "ml5";

interface configOption {
  /**调用时执行 */
  init?: () => void;
  /**加载开始执行 */
  load?: (evt: any) => void;
  /**加载完毕执行 */
  done?: (evt: any) => void;
}

/** 初始化模型 */
export async function patterningOcr(option: configOption): Promise<any> {
  const featureExtractor: any = await new Promise((resolve, reject) => {
    option.init && option.init();
    ml5.imageClassifier("MobileNet", (err: any, evt: any) => {
      if (err) {
        return reject(err);
      }
      option.load && option.load(evt);
      evt.ready.then((res: any) => {
        option.done && option.done(res);
        resolve(res);
      });
    });
  });
  return {
    imgClassify: (canvas: HTMLCanvasElement, cb: (err?: string, status?: any[]) => void) => {
      const img = new Image();
      img.src = getCanvasBase64(canvas);
      featureExtractor.classify(img, cb)
    }
  }
}

/** canvas转base64 */
export function getCanvasBase64(canvas: HTMLCanvasElement) {
  return canvas.toDataURL("image/png");
}
