import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { layer } from 'navyd';
import uniConfig from '@/config';
import { errorHandle, generateCacheKey, StatusCode } from './helper';

export interface RequestConfig {
  // 请求类型
  type?: 'put' | 'post' | 'get' | 'delete' | 'put-qs' | 'post-qs';
  // 请求参数类型
  contentType?: 'application/json' | 'application/x-www-form-urlencoded';
  // 其他的请求头信息
  extraRequestHeaders?: Record<string, string>;
  // 是否返回 response header 默认false
  returnHeaders?: boolean;
  // 是否缓存优先 针对get请求
  cacheFirst?: boolean;
  // 是否弹出错误信息
  ifToastErrorMsg?: boolean;
  // 请求参数
  data?: any;
  // 返回值类型
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

const baseConfig: RequestConfig = {
  type: 'get',
  contentType: 'application/json',
  extraRequestHeaders: {},
  returnHeaders: false,
  cacheFirst: true,
  ifToastErrorMsg: true,
  data: {},
  responseType: 'json'
};

const baseURL = import.meta.env.VITE_API_BASE_URL;
type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

const isSilentRefreshEnabled = () => Boolean(uniConfig.enableSilentRefresh && uniConfig.refreshTokenUrl);
let refreshPromise: Promise<void> | null = null;

const pickHeader = (headers: Record<string, any> | undefined, key?: string) => {
  if (!headers || !key) return undefined;
  const lowerKey = key.toLowerCase();
  return headers[lowerKey] ?? headers[key];
};

const persistTokens = (headers: Record<string, any> | undefined, payload: Record<string, any> = {}) => {
  const tokenHeaderKey = uniConfig.TOKEN_HEADER_KEY || uniConfig.tokenHeaderKey || 'authz';
  const refreshHeaderKey = uniConfig.REFRESH_TOKEN_HEADER_KEY || uniConfig.refreshTokenHeaderKey || 'authz-refresh';
  const accessTokenFromHeader = pickHeader(headers, tokenHeaderKey);
  const refreshTokenFromHeader = pickHeader(headers, refreshHeaderKey);
  const accessToken = accessTokenFromHeader ?? payload.token ?? payload.accessToken ?? payload[uniConfig.ACCESS_TOKEN_KEY];
  const refreshToken = refreshTokenFromHeader ?? payload.refreshToken ?? payload.rtoken ?? payload[uniConfig.REFRESH_TOKEN_KEY];
  if (accessToken) {
    localStorage.setItem(uniConfig.ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(uniConfig.REFRESH_TOKEN_KEY, refreshToken);
  }
};

const clearTokens = () => {
  localStorage.removeItem(uniConfig.ACCESS_TOKEN_KEY);
  localStorage.removeItem(uniConfig.REFRESH_TOKEN_KEY);
};

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;
  if (!isSilentRefreshEnabled()) {
    return Promise.reject(new Error('silent refresh disabled'));
  }
  const refreshToken = localStorage.getItem(uniConfig.REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    clearTokens();
    return Promise.reject(new Error('no refresh token'));
  }
  const refreshUrl = uniConfig.refreshTokenUrl as string;

  // Create axios instance with proper configuration for refresh request
  const refreshAxios = axios.create({ baseURL });

  refreshPromise = refreshAxios.post(
    refreshUrl,
    { refreshToken },
    {
      headers: {
        'aware_organization_uid': '1',
        'Content-Type': 'application/json'
      }
    }
  ).then((res) => {
    if (res.data?.code !== StatusCode.SUCCESS) {
      clearTokens();
      return Promise.reject(res.data);
    }
    const payload = res.data?.data || {};
    persistTokens(res.headers, payload);
  }).catch((error) => {
    clearTokens();
    throw error;
  }).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

const retryWithFreshToken = async (
  axiosInstance: AxiosInstance,
  originalConfig: RetryableConfig | undefined,
  fallbackError: any
) => {
  if (!isSilentRefreshEnabled()) return Promise.reject(fallbackError);
  if (!originalConfig || originalConfig._retry) return Promise.reject(fallbackError);
  if (!localStorage.getItem(uniConfig.REFRESH_TOKEN_KEY)) return Promise.reject(fallbackError);
  if (uniConfig.refreshTokenUrl && originalConfig.url && originalConfig.url.indexOf(uniConfig.refreshTokenUrl) !== -1) {
    return Promise.reject(fallbackError);
  }
  try {
    await refreshAccessToken();
    originalConfig._retry = true;
    // CRITICAL FIX: Update headers with new token before retry
    originalConfig.headers = originalConfig.headers || {};
    originalConfig.headers[uniConfig.TOKEN_HEADER_KEY!] = localStorage.getItem(uniConfig.ACCESS_TOKEN_KEY) || null;
    return axiosInstance(originalConfig);
  } catch (e) {
    return Promise.reject(fallbackError);
  }
};

const request = (
  function () {
    const cache = new Map<string, any>();
    return async <T = any>(url: string, options: RequestConfig = {}) => {
      const ins = axios.create({
        baseURL: baseURL
      });
      const config = Object.assign({}, baseConfig , options);

      // 请求前拦截
      ins.interceptors.request.use(
        axiosConfig => {
          // token
          axiosConfig.headers[uniConfig.TOKEN_HEADER_KEY!] = localStorage.getItem(uniConfig.ACCESS_TOKEN_KEY) || null;
          // TODO 如需别的headers信息，按需
          return axiosConfig;
        }
      );

      // 返回拦截
      ins.interceptors.response.use(
        async function (res) {
          const responseData = config.returnHeaders ? { data: res.data.data, headers: res.headers } : res.data;
          if (res.request.responseType === 'blob') {
            if (config.returnHeaders) return { data: res.data, headers: res.headers };
            else return res.data;
          }
          if (res.data.code === StatusCode.SUCCESS) return responseData;
          // 非 SUCCESS 情况
          config.ifToastErrorMsg && (() => {
            if (res.data?.msg) layer.error(res.data?.msg || '');
            else {
              layer.error('未知错误');
              console.error(res.data);
            }
          })();
          return Promise.reject(responseData);
        },
        // 接口直接报错 状态码为非200
        async function (error) {
          if (error?.response?.data?.code === StatusCode.TOKEN_EXPIRED) {
            try {
              return await retryWithFreshToken(ins, error.config as RetryableConfig, error);
            } catch (e) {
              // continue to default handling below
            }
          }
          config.ifToastErrorMsg && errorHandle(error, config);
          return Promise.reject(error);
        }
      );

      if (config.type === 'get') {
        if (config.cacheFirst) {
          const key = generateCacheKey(url, config);
          if (cache.has(key)) {
            return cache.get(key) as T;
          } else {
            return ins({
              url,
              method: config.type,
              params: config.data,
              responseType: config.responseType
            }) as T;
          }
        }
      }
      if (config.type === 'delete') {
        return ins({
          url,
          method: config.type,
          params: config.data,
          responseType: config.responseType
        }) as T;
      }
      if (config.type && config.type.indexOf('qs') !== -1) {
        const queryString = new URLSearchParams(config.data as URLSearchParams).toString();
        return ins({
          url: `${url}?${queryString}`,
          method: config.type.split('-').shift(),
          data: config.data,
          responseType: config.responseType
        }) as T;
      }
      // 其他情况 请求然后返回
      return ins({
        url,
        method: config.type,
        data: config.data,
        responseType: config.responseType
      }) as T;
    };
  }
)();

export default request;
