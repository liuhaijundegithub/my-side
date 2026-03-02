import { layer } from 'navyd';
import { RequestConfig } from './index';
import { AxiosError } from 'axios';
import { goTo } from '@/utils/history';

export enum StatusCode {
  SUCCESS = 'SUCCESS',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_KICKOUT = 'TOKEN_KICKOUT',
  PARAM_BAD = 'PARAM_BAD',
  TOKEN_LACK = 'TOKEN_LACK',
  NOPERMISSION = 'NOPERMISSION'
}


export function transJsonToFormdata(params: Record<any, any>) {
  if (params instanceof FormData) {
    return params;
  }
  try {
    const fd = new FormData();
    Object.keys(params).forEach((key) => {
      fd.append(key, params[key]);
    });
    return fd;
  } catch (e) {
    return params;
  }
}

export const generateCacheKey = (url: string, config: RequestConfig) => {
  const {
    type,
    data = {}
  } = config;
  return [type, url, JSON.stringify(data)].join('&');
};

const errorMsg: Record<string, string> = {
  TOKEN_INVALID: '登录状态异常，请重新登录',
  TOKEN_EXPIRED: '登录信息已失效，请重新登录',
  TOKEN_KICKOUT: '同一账号已在其他地方登录，如非本人操作，建议尽快修改密码',
  PARAM_BAD: '参数异常',
  TOKEN_LACK: '登录信息已失效，请重新登录',
  NOPERMISSION: '没有权限访问该接口'
};


export const errorHandle = (() => {
  let handled = false;
  return function (error: any, config: RequestConfig) {
    if (handled) return false;
    if (!error.response) {
      const e = error as AxiosError;
      layer.error(e.message);
      return false;
    }
    if (error.response.data.code?.includes('TOKEN')) {
      // 只针对TOKEN相关的错误进行提示控制，只允许出现一次alert
      handled = true;
      layer.alert({
        title: '提示',
        content: errorMsg[error.response.data.code],
        onConfirm: function () {
          localStorage.clear();
          goTo('/login', { replace: true });
          handled = false;
        }
      });

    } else if (error.response.data.code === 'NOPERMISSION') {
      goTo('/401', { replace: true });
    } else {
      config.ifToastErrorMsg && layer.error(error.response.data.msg);
    }
  };
})();
