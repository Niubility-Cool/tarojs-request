import { Option, Response } from './type';

/**
 * Request Error
 *
 * @export
 * @class RequestError
 * @extends {Error}
 * @template ReqData
 */
export class RequestError<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
> extends Error {
  public request: Option<ReqData>;
  public type: string;

  /**
   * Creates an instance of RequestError.
   *
   * @param {string} text
   * @param {Option<ReqData>} request
   * @param {string} [type='RequestError']
   * @memberof RequestError
   */
  constructor(
    text: string,
    request: Option<ReqData>,
    type: string = 'RequestError',
  ) {
    super(text);
    this.name = 'RequestError';
    this.request = request;
    this.type = type;
  }
}

/**
 * Response Error
 *
 * @export
 * @class ResponseError
 * @extends {Error}
 * @template ReqData
 * @template ResData
 */
export class ResponseError<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
  ResData = any,
> extends Error {
  public data: Response<ResData>;
  public response: any;
  public request: Option<ReqData>;
  public type: string;
  /**
   * Creates an instance of ResponseError.
   * @param {Taro.request.SuccessCallbackResult<Response<ResData>>} response
   * @param {*} text
   * @param {*} data
   * @param {Option<ReqData>} request
   * @param {string} [type='ResponseError']
   * @memberof ResponseError
   */
  constructor(
    response: Taro.request.SuccessCallbackResult<Response<ResData>>,
    text: string,
    data: Response<ResData>,
    request: Option<ReqData>,
    type: string = 'ResponseError',
  ) {
    super(text || response.errMsg);
    this.name = 'ResponseError';
    this.data = data;
    this.response = response;
    this.request = request;
    this.type = type;
  }
}

/**
 * Timeout reject promise
 *
 * @export
 * @template ReqData
 * @param {number} msec
 * @param {string | undefined} timeoutMessage
 * @param {Option<ReqData>} request
 * @return {*}
 */
export function timeout2Throw<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
  ResData = any,
>(msec: number, timeoutMessage: string | undefined, request: Option<ReqData>) {
  return new Promise<Taro.request.SuccessCallbackResult<Response<ResData>>>(
    (_, reject) => {
      setTimeout(() => {
        reject(
          new RequestError(
            timeoutMessage || `timeout of ${msec}ms exceeded`,
            request,
            'Timeout',
          ),
        );
      }, msec);
    },
  );
}

/**
 * Abort reject promise
 *
 * @export
 * @template ReqData
 * @template ResData
 * @param {Option<ReqData>} request
 * @param {Taro.RequestTask<Response<ResData>>} instance
 * @return {*}
 */
export function abort2Throw<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
  ResData = any,
>(request: Option<ReqData>, instance: Taro.RequestTask<Response<ResData>>) {
  return new Promise<Taro.request.SuccessCallbackResult<Response<ResData>>>(
    (_, reject) => {
      if (request.signal) {
        request.signal.addEventListener('abort', () => {
          instance.abort();
          reject(new Error('__ABORTED__'));
        });
      }
    },
  );
}
