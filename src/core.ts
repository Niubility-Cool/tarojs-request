import compose, { Middleware } from 'koa-compose';
import requestMiddleware from './middleware/request';
import { Context, Response, Option } from './type';

/**
 * Merge request options
 *
 * @export
 * @template ReqData
 * @param {Partial<Option<ReqData>>} options
 * @param {Option<ReqData>} options2Merge
 * @return {*}
 */
export function mergeRequestOptions<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
>(
  options: Partial<Option<ReqData>>,
  options2Merge: Option<ReqData>,
): Option<ReqData> {
  return {
    ...options,
    ...options2Merge,
    header: {
      ...options.header,
      ...options2Merge.header,
    },
    data: Object.assign({}, options.data, options2Merge.data),
    method: options2Merge.method || options.method || 'GET',
  };
}

/**
 * Request Core
 *
 * @class Core
 */
class Core {
  public middleware: Middleware<any>[];
  public initOptions: Partial<Option<any>> = {};

  /**
   * Creates an instance of Request.
   *
   * @param {Partial<Option<any>>} [initOptions={}]
   * @memberof Request
   */
  public constructor(initOptions: Partial<Option<any>> = {}) {
    this.middleware = [];
    this.initOptions = initOptions;
  }

  /**
   * Add middleware
   *
   * @template ReqData
   * @template Res
   * @param {Middleware<Context<ReqData, Res>>} fn
   * @memberof Request
   */
  public use<
    ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
    Res = any,
  >(fn: Middleware<Context<ReqData, Res>>) {
    this.middleware.push(fn);
  }

  /**
   * Request method
   *
   * @template ReqData
   * @template ResData
   * @param {Option<ReqData>} option
   * @return {*}
   * @memberof Request
   */
  public request<
    ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
    ResData = any,
  >(option: Option<ReqData>) {
    return new Promise<Taro.request.SuccessCallbackResult<Response<ResData>>>(
      (resolve, reject) => {
        const ctx: Context<ReqData, ResData> = {
          req: mergeRequestOptions(this.initOptions, option),
          res: undefined,
        };
        const fn = compose<Context<ReqData, ResData>>([
          ...this.middleware,
          requestMiddleware,
        ]);
        fn(ctx)
          .then(() => {
            if (ctx.res) {
              resolve(ctx.res);
            } else {
              throw new Error('NONE REQUEST RESPONSE!');
            }
          })
          .catch((error) => {
            const { errorHandler } = ctx.req;
            if (errorHandler) {
              try {
                const data = errorHandler(error);
                resolve(data);
              } catch (e) {
                reject(e);
              }
            } else {
              reject(error);
            }
          });
      },
    );
  }
}

export default Core;
