import { NavigateOptions, useLocation, useNavigate, useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { cloneDeep } from 'lodash';
import routes from '@/routers/routes.tsx';
import { useEffect, useMemo } from 'react';
import { extractPathParams, findExactRoute, getRoutes } from '@/utils/router.ts';
import useRouterStore from '@/store/useRouterSotre.ts';

const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY || 'default_secret_key';

interface Params {
  queryParams?: Record<string, ID>;
  routeParams?: Record<string, ID>;
}

const useRouter = () => {
  const location = useLocation();
  const navigator = useNavigate();
  const iv = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607, 0x08090a0b, 0x0c0d0e0f]);
  const rawKey = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  // eslint-disable-next-line new-cap
  const key = CryptoJS.SHA256(rawKey);
  const routerStore = useRouterStore();


  // 安全加密函数
  const encryptParams = (value: ID): string => {
    let str = '';
    if (value === null || value === undefined) return '';
    else str = typeof value === 'string' ? value : value.toString();
    try {
      const encrypted = CryptoJS.AES.encrypt(str, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return encrypted.toString().replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/, '');
    } catch (error) {
      console.error('Encryption error:', error);
      return str; // 失败时返回原始值
    }
  };

  // 安全解密函数
  const decryptParams = (value: string): string => {
    try {
      let ciphertext = value.replace(/-/g, '+').replace(/_/g, '/');
      const padLength = 4 - (ciphertext.length % 4);
      ciphertext += padLength < 4 ? '='.repeat(padLength) : '';
      const bytes = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return bytes.toString(CryptoJS.enc.Utf8) || value; // 解密失败返回原始值
    } catch (error) {
      console.error('Decryption error:', error);
      return value;
    }
  };

  // 处理参数
  const processParams = (path: string, options: Params = {})=> {
    // 处理路由参数加密
    let finalPath = path;

    // path 中需要哪些 routeParams
    const requireParamKeys = extractPathParams(path);
    if (requireParamKeys.length > 0) {
      // 来源1： store 中已存在的参数
      const keys1 = Object.keys(routerStore.routeParams);
      // 来源2： 当前路由传入的 routeParams
      const keys2 = Object.keys(options.routeParams || {});
      // 逐个替换
      requireParamKeys.forEach(key => {
        if (keys2.includes(key)) {
          const encryptedValue = encryptParams(options.routeParams?.[key] || '');
          finalPath = finalPath.replace(`:${key}`, encryptedValue);
          // 存起来，以备下次使用
          routerStore.setRouteParam(key, encryptedValue);
        } else if (keys1.includes(key)) {
          finalPath = finalPath.replace(`:${key}`, routerStore.routeParams[key]?.toString() || '');
        } else {
          throw new Error(`路由参数${key}未定义`);
        }
      });
    }

    // 处理查询参数加密
    let queryString = '';
    if (options.queryParams) {
      const encryptedQueryParams = Object.entries(options.queryParams).reduce(
        (acc, [key, value]) => {
          acc[key] = encryptParams(value);
          return acc;
        },
        {} as Record<string, string>
      );
      queryString = new URLSearchParams(encryptedQueryParams).toString();
    }

    return queryString ? `${ finalPath }?${ queryString }` : finalPath;
  };

  const to = (params: {
    name?: string;
    path?: string;
    queryParams?: Record<string, ID>;
    routeParams?: Record<string, ID>;
    navigateOptions?: NavigateOptions;
  }) => {
    const { name, path, queryParams, routeParams, navigateOptions } = params;
    if (path) {
      toPath(path, { queryParams, routeParams }, navigateOptions);
    } else if (name) {
      toName(name, { queryParams, routeParams }, navigateOptions);
    } else {
      throw new Error('请提供name或path参数');
    }
  };

  // 通过路由 path 跳转
  const toPath = (path: string, options: Params = {}, navigateOptions?: NavigateOptions) => {
    const fullPath = processParams(path, options);
    // 执行导航
    navigator(fullPath, navigateOptions);
  };

  // 通过路由 name 跳转
  const toName = (name: string, options: Params = {}, navigateOptions?: NavigateOptions) => {
    const route: UniRouteObject = findRouteByName(name);
    toPath(route.path, options, navigateOptions);
  };

  const open = (params: {
    name?: string;
    path?: string;
    queryParams?: Record<string, ID>;
    routeParams?: Record<string, ID>;
  })=> {
    const { name, path, queryParams, routeParams } = params;
    if (path) {
      openByPath(path, { queryParams, routeParams });
    } else if (name) {
      openByName(name, { queryParams, routeParams });
    } else {
      throw new Error('请提供name或path参数');
    }
  };

  // 新窗口打开 - path
  const openByPath = (path: string, options: Params = {}) => {
    const fullPath = processParams(path, options);
    window.open(fullPath, '_blank');
  };

  // 新窗口打开 - name
  const openByName = (name: string, options: Params = {}) => {
    const route: UniRouteObject = findRouteByName(name);
    openByPath(route.path, options);
  };

  const flattenRoutesWithFullPath: UniRouteObject[] = useMemo(() => {
    return getRoutes(cloneDeep(routes));
  }, [routes]);

  // 查找name
  const findRouteByName: UniRouteObject = (name: string) => {
    const filteredRoutes: UniRouteObject[] = flattenRoutesWithFullPath.filter(route => route.name === name);
    if (filteredRoutes.length === 0) {
      throw new Error(`name: ${name}未找到路由，请检查路由配置`);
    }
    if (filteredRoutes.length > 1) {
      throw new Error(`name: ${name}对应多个路由，请检查路由配置`);
    }
    // 返回第一个匹配的路由
    return filteredRoutes[0];
  };

  // 检查当前路由是否需要routeParams
  useEffect(() => {
    // 查找精确匹配的路由
    const matchingRoute = findExactRoute(location.pathname, flattenRoutesWithFullPath);

    if (matchingRoute?.path) {
      // 检查路由定义中是否包含参数占位符
      const requireParamKeys = extractPathParams(matchingRoute.path);
      const hasRouteParams = requireParamKeys.length > 0;


      // 根据是否需要routeParams执行不同逻辑
      if (!hasRouteParams) {
        // 当前路由不需要routeParams，清空store中的参数
        routerStore.clearRouteParams();
      } else {
        // 否则只删除多余的参数
        routerStore.deleteRouteParam(Object.keys(routerStore.routeParams).filter(key => !requireParamKeys.includes(key)));
      }
    } else {
      console.error('未找到匹配的路由定义，当前路径:', location.pathname);
    }
  }, [location.pathname]); // 监听路由路径变化


  const getSearchParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const result: Record<string, string> = {};
    for (const [key, encryptedValue] of searchParams.entries()) {
      result[key] = decryptParams(encryptedValue);
    }
    return result;
  };
  const getDecodedParams = () => {
    const res = useParams();
    const o: Record<string, string | undefined> = {};
    for (const [key, encryptedValue] of Object.entries(res)) {
      if (encryptedValue) {
        o[key] = decryptParams(encryptedValue);
      }
    }
    return o;
  };
  return {
    to,
    open,
    getSearchParams,
    getParams: useParams,
    getDecodedParams,
    encryptParams,
    decryptParams,
    back: () => {
      navigator(-1);
    }
  };
};

export default useRouter;
