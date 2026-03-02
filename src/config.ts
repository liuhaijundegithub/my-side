import type { ThemeConfig } from 'antd/es/config-provider';
import type { InterceptorConfig } from './utils/externalLinkInterceptor';

interface UniConfig {
  // 后端接口默认的前缀
  urlPrefix: string;
  // antd主题配置
  // 这里的主题配置的如果有colorPrimary和 colorText属性会覆盖掉@unisolution/components的主题配置
  // 颜色的值必须要使用16进制的颜色值, 否则 unisolution/components-react的颜色计算会失效
  antdTheme: ThemeConfig;
  // 暗色主题配置
  antdDarkTheme?: ThemeConfig;
  // 路由模式
  routerType: 'browser' | 'hash';
  // 路由的白名单
  whiteList: string[];
  // iconfont的cdn地址
  iconfontUrl?: string;
  // token的本地存储key
  ACCESS_TOKEN_KEY: string;
  // 刷新token的本地存储key
  REFRESH_TOKEN_KEY: string;
  // 是否开启token过期无感刷新
  enableSilentRefresh?: boolean;
  // token刷新接口
  refreshTokenUrl?: string;
  // 刷新/登录返回头里的token字段名
  TOKEN_HEADER_KEY?: string;
  REFRESH_TOKEN_HEADER_KEY?: string;
  // 兼容旧写法
  tokenHeaderKey?: string;
  refreshTokenHeaderKey?: string;
  // 外链拦截器配置
  externalLinkInterceptor?: InterceptorConfig;
}

const config: UniConfig = {
  urlPrefix: '/lodging',
  antdTheme: {
    token: {
      colorPrimary: '#5197ff',
      borderRadius: 4,
      colorText: '#39393b',
      motion: false,
      message: { maxCount: 1 }
    }
  } as ThemeConfig,
  antdDarkTheme: {
    token: {
      colorPrimary: '#5197ff',
      borderRadius: 4,
      colorText: '#e5e5e5',
      colorBgContainer: '#252525',
      colorBgElevated: '#1a1a1a',
      colorBorder: '#333333',
      motion: false,
      message: { maxCount: 1 }
    },
    algorithm: undefined
  } as ThemeConfig,
  routerType: 'browser',
  whiteList: [],
  iconfontUrl: '//at.alicdn.com/t/c/font_2298995_26olphm3v0b.js',
  ACCESS_TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'rtoken',
  enableSilentRefresh: true,
  refreshTokenUrl: '/auth/refresh',
  TOKEN_HEADER_KEY: 'authz',
  REFRESH_TOKEN_HEADER_KEY: 'authz-refresh',
  // 外链拦截器配置示例
  externalLinkInterceptor: {
    redirectPath: '/page-redirect', // 重定向页面路径
    // 白名单：这些域名可以直接跳转，不需要确认（注意：只能填写域名，不能带 http:// 或 https:// 前缀）
    whitelist: [],
    // 黑名单：这些域名将被阻止访问（注意：只能填写域名，不能带 http:// 或 https:// 前缀）
    blacklist: []
  }
};

export default config;
