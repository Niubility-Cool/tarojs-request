# tarojs-request

小程序网络请求库，基于 `Taro.request` & `koa-compose` 封装, 旨在为开发者提供一个简单易用，易扩展的 api 调用方式。

## 支持的功能

- `Typescript` 支持
- `koa` 洋葱机制的 `use` 中间件机制支持
- `timeout` 支持
- 统一的`错误处理`方式

## 安装

```bash
npm install --save tarojs-request
```

## 快速上手

执行`GET`请求

```ts
import request from 'tarojs-request';

request('https://xxx.xxx.xxx/xxx', { xxx: 'xxx' })
  .then(console.log)
  .catch(console.log);
```

执行`POST`请求

```ts
import request from 'tarojs-request';

request('https://xxx.xxx.xxx/xxx', { xxx: 'xxx' }, 'POST')
  .then(console.log)
  .catch(console.log);
```

## tarojs-request API

- request【请求】

```ts
// 类型
function request<ResData, ReqData>(
  url: string,
  data?: ReqData,
  method?: string,
  extra?: Taro.request.Option,
): Promise<Taro.request.SuccessCallbackResult<Response<ResData>>>;

// 案例
import request from 'tarojs-request';

request('https://xxx.xxx.xxx/xxx', { xxx: 'xxx' }, 'POST', {
  header: {
    xx: 'xxx',
  },
})
  .then(console.log)
  .catch(console.log);
```

- extend【创建请求实例】

```ts
// 类型
function extend<ReqData>(initOptions?: Taro.request.Option<ReqData>>): Request;

// 案例
import { extend } from 'tarojs-request';

const customRequest = extend({
  timeout: 5000,
});

customRequest('https://xxx.xxx.xxx/xxx', { xxx: 'xxx' }, 'POST', {
  header: {
    xx: 'xxx',
  },
})
  .then(console.log)
  .catch(console.log);
```

## 请求配置

> 以下仅列出对比 [Taro.request](https://docs.taro.zone/docs/apis/network/request/request#option) 请求配置新增的 item

| 参数           | 类型                  | 默认值 | 必填 | 说明                                   |
| -------------- | --------------------- | ------ | ---- | -------------------------------------- |
| errorHandler   | (error: Error) => any | -      | 否   | 错误处理                               |
| timeoutMessage | string                | -      | 否   | 超时可自定义提示文案, 需先定义 timeout |
| signal         | AbortSignal           | -      | 否   | AbortSignal 终止请求                   |

## 响应结构

响应结构同 [Taro.request.SuccessCallbackResult](https://docs.taro.zone/docs/apis/network/request/request#successcallbackresult) 一致。

## 错误处理

```ts
import request, { extend } from 'tarojs-request';

const errorHandler = function (error) {
  const codeMap = {
    '021': '发生错误啦',
    '022': '发生大大大大错误啦',
    // ....
  };
  if (error.response) {
    // 请求已发送但服务端返回状态码非 2xx 的响应
    console.log(error.response.status);
    console.log(error.response.headers);
    console.log(error.data);
    console.log(error.request);
    console.log(codeMap[error.data.status]);
  } else {
    // 请求初始化时出错或者没有响应返回的异常
    console.log(error.message);
  }

  throw error; // 如果throw. 错误将继续抛出.

  // 如果return, 则将值作为返回. 'return;' 相当于return undefined, 在处理结果时判断response是否有值即可.
  // return {some: 'data'};
};

// 1. 作为统一错误处理
const extendRequest = extend({ errorHandler });

// 2. 单独特殊处理, 如果配置了统一处理, 但某个api需要特殊处理. 则在请求时, 将errorHandler作为参数传入.
request('/api/v1/xxx', { x: 'xxx' }, 'GET', { errorHandler });

// 3. 通过 Promise.catch 做错误处理
request('/api/v1/xxx')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    return errorHandler(error);
  });
```

## 中间件

同 Koa 中间件创建和使用保持一致，让开发者优雅地做请求前后的增强处理。

request.use((ctx, next))

- ctx(Object)：上下文对象，包括 req 和 res 对象
- next(Function)：调用下一个中间件的函数

案例

```ts
import Taro from '@tarojs/taro';
import request from 'tarojs-request';
import { Middleware } from 'koa-compose';
import { Context } from '../type';

/**
 * Check network
 *
 * @param {*} _ctx
 * @param {*} next
 * @return {*}
 */
const networkCheckMiddleware: Middleware<Context> = async (_ctx, next) => {
  // 获取网络状态
  const networkState = await Taro.getNetworkType();
  if (networkState.networkType === 'none') {
    throw new Error('当前网络不可用');
  }
  await next();
};

request.use(networkCheckMiddleware);
```

tarojs-request 提供了一个内置中间件 `networkCheckMiddleware`

## 中止请求

通过 AbortController 来中止请求

```ts
import request, { AbortController } from 'tarojs-request';

const controller = new AbortController(); // 创建一个控制器
const { signal } = controller; // 返回一个 AbortSignal 对象实例，它可以用来 with/abort 一个 DOM 请求。

signal.addEventListener('abort', () => {
  console.log('aborted!');
});

request('/api/response_after_1_sec', {
  signal, // 这将信号和控制器与获取请求相关联然后允许我们通过调用 AbortController.abort() 中止请求
});

// 取消请求
setTimeout(() => {
  controller.abort(); // 中止一个尚未完成的 DOM 请求。这能够中止 fetch 请求，任何响应 Body 的消费者和流。
}, 100);
```
