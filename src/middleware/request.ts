import Taro from '@tarojs/taro';
import { Context, Response } from '../type';
import { abort2Throw, timeout2Throw } from '../utils';

/**
 * Core middleware of taro-request
 * Use Taro.request as our native request methods
 *
 * @template ReqData
 * @template ResData
 * @param {Context<ReqData, ResData>} ctx
 * @return {*}
 */
function requestMiddleware<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
  ResData = any,
>(ctx: Context<ReqData, ResData>) {
  const { req } = ctx;
  const { timeout, timeoutMessage } = req;

  const instance = Taro.request<Response<ResData>, ReqData>(req);

  let response: Promise<Taro.request.SuccessCallbackResult<Response<ResData>>>;

  if (timeout && timeout > 0) {
    response = Promise.race([
      abort2Throw<ReqData, ResData>(ctx.req, instance),
      instance,
      timeout2Throw<ReqData, ResData>(timeout, timeoutMessage, ctx.req),
    ]);
  } else {
    response = Promise.race([
      abort2Throw<ReqData, ResData>(ctx.req, instance),
      instance,
    ]);
  }

  return response.then((res) => {
    ctx.res = res;
    ctx.data = res.data;
  });
}

export default requestMiddleware;
