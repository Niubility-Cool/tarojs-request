import Core from './core';
import { Option, Request } from './type';

/**
 * Create easy request method
 *
 * @param {Core} core
 * @return {*}
 */
function requestFactory(core: Core) {
  return <
    ResData = any,
    ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
  >(
    url: string,
    data?: ReqData,
    method: keyof Taro.request.method = 'GET',
    extra?: Omit<Option<ReqData>, 'url' | 'data' | 'method'>,
  ) => core.request<ReqData, ResData>({ url, data, method, ...extra });
}

/**
 * Create request instance
 *
 * @export
 * @param {Partial<Option<any>>} [initOptions={}]
 * @return {*}
 */
function request<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
>(initOptions: Partial<Option<ReqData>> = {}): Request {
  const coreInstance = new Core(initOptions);
  const instance = requestFactory(coreInstance) as Request;
  instance.use = coreInstance.use.bind(coreInstance);
  return instance;
}

/**
 * Gen custom request instance
 *
 * @export
 * @param {Partial<Option<any>>} [initOptions]
 * @return {*}
 */
export function extend<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
>(initOptions?: Partial<Option<ReqData>>) {
  return request(initOptions);
}

export default request();
