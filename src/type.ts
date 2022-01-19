import { Middleware } from 'koa-compose';
import { AbortSignal } from 'abort-controller';

export interface Response<T = any> {
  code: number;
  data: T;
  msg?: string;
  [key: string]: any;
}

export interface Option<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
> extends Taro.request.Option<ReqData> {
  errorHandler?: (error: Error) => any;
  timeoutMessage?: string;
  signal?: AbortSignal;
}

export interface Context<
  ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
  ResData = any,
> {
  req: Option<ReqData>;
  data?: Response<ResData>;
  res?: Taro.request.SuccessCallbackResult<Response<ResData>>;
}

export interface Request {
  <
    ResData = any,
    ReqData extends string | TaroGeneral.IAnyObject | ArrayBuffer = any | any,
  >(
    url: string,
    data?: ReqData,
    method?: keyof Taro.request.method,
    extra?: Omit<Option<ReqData>, 'url' | 'data' | 'method'>,
  ): Promise<Taro.request.SuccessCallbackResult<Response<ResData>>>;
  use: <ReqData = any, Res = any>(
    fn: Middleware<Context<ReqData, Res>>,
  ) => void;
}
