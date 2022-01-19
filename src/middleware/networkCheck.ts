import Taro from '@tarojs/taro';
import { Middleware } from 'koa-compose';
import { Context } from '../type';

/**
 * Check network
 *
 * @param {*} _ctx
 * @param {*} next
 * @return {*}
 */
const networkCheck: Middleware<Context> = async (_ctx, next) => {
  const networkState = await Taro.getNetworkType();
  if (networkState.networkType === 'none') {
    throw new Error('当前网络不可用');
  }
  await next();
};

export default networkCheck;
