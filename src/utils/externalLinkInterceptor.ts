// ExternalLinkInterceptor 工具方法
// 用于拦截外部链接访问，将其重定向到确认页面

// 拦截器配置接口
export interface InterceptorConfig {
  redirectPath?: string; // 重定向路径，默认 '/page-redirect'
  whitelist?: string[]; // 白名单域名，这些域名可以直接跳转不需要确认（注意：只能填写域名，如 'github.com'，不能带 http:// 或 https:// 前缀）
  blacklist?: string[]; // 黑名单域名，这些域名将被阻止访问（注意：只能填写域名，如 'malicious.com'，不能带 http:// 或 https:// 前缀）
  allowedProtocols?: string[]; // 允许直接跳转的协议列表（非http/https），默认 ['mailto:', 'tel:', 'ftp:', 'data:', 'blob:', 'file:']
  enableLogging?: boolean; // 是否启用日志，默认 true
}

// 链接处理动作类型
export type LinkAction = 'allow' | 'block' | 'intercept';

// 保存原始的 window.open 方法，用于重定向页面使用
let savedOriginalWindowOpen: typeof window.open | null = null;

// 默认的特殊协议列表（不需要拦截）
const DEFAULT_SPECIAL_PROTOCOLS = ['mailto:', 'tel:', 'ftp:', 'data:', 'blob:', 'file:'];

// 判断是否是特殊协议（非 http/https，可以直接跳转）
const isSpecialProtocol = (url: string, config: InterceptorConfig = {}): boolean => {
  const protocols = config.allowedProtocols || DEFAULT_SPECIAL_PROTOCOLS;
  return protocols.some(protocol => url.toLowerCase().startsWith(protocol.toLowerCase()));
};

// 统一的域名匹配函数（支持白名单和黑名单）
const checkDomainList = (url: string, domainList: string[] = []): boolean => {
  if (domainList.length === 0) return false;
  try {
    const urlObj = new URL(url, window.location.href);
    return domainList.some(domain => {
      // 支持精确匹配和子域名匹配
      if (domain === urlObj.hostname) return true;
      // 如果域名项以 . 开头，则匹配子域名
      if (domain.startsWith('.')) {
        return urlObj.hostname.endsWith(domain.slice(1)) || urlObj.hostname === domain.slice(1);
      }
      return false;
    });
  } catch (error) {
    console.error('[ExternalLinkInterceptor] Failed to parse URL for domain check:', url, error);
    return false;
  }
};

// 检查 URL 是否在白名单中
const isInWhitelist = (url: string, whitelist: string[] = []): boolean => {
  return checkDomainList(url, whitelist);
};

// 检查 URL 是否在黑名单中
const isInBlacklist = (url: string, blacklist: string[] = []): boolean => {
  return checkDomainList(url, blacklist);
};

// 统一的拦截决策函数
// 返回值: 'allow' (允许直接访问), 'block' (阻止访问), 'intercept' (需要拦截到确认页)
const decideLinkAction = (url: string, config: InterceptorConfig = {}): LinkAction => {
  const enableLogging = config.enableLogging !== false; // 默认启用日志

  try {
    // 1. 检查是否是特殊协议（允许直接访问）
    if (isSpecialProtocol(url, config)) {
      if (enableLogging) console.log('[ExternalLinkInterceptor] Special protocol detected, allowing:', url);
      return 'allow';
    }

    // 2. 解析 URL
    const urlObj = new URL(url, window.location.href);
    const currentOrigin = window.location.origin;
    const linkOrigin = urlObj.origin;

    // 3. 同源链接允许直接访问
    if (linkOrigin === currentOrigin) {
      if (enableLogging) console.log('[ExternalLinkInterceptor] Same origin link, allowing:', url);
      return 'allow';
    }

    // 4. 检查黑名单（阻止访问）
    if (isInBlacklist(url, config.blacklist)) {
      if (enableLogging) console.warn('[ExternalLinkInterceptor] URL blocked by blacklist:', url);
      return 'block';
    }

    // 5. 检查白名单（允许直接访问）
    if (isInWhitelist(url, config.whitelist)) {
      if (enableLogging) console.log('[ExternalLinkInterceptor] URL in whitelist, allowing:', url);
      return 'allow';
    }

    // 6. 其他外部链接需要拦截
    if (enableLogging) console.log('[ExternalLinkInterceptor] External link, intercepting:', url);
    return 'intercept';
  } catch (error) {
    console.error('[ExternalLinkInterceptor] Invalid URL:', url, error);
    return 'allow'; // 无效 URL 不拦截，避免影响正常功能
  }
};

// 判断是否是外部链接（保持向后兼容）
const isExternal = (url: string, config: InterceptorConfig = {}): boolean => {
  const action = decideLinkAction(url, config);
  return action === 'intercept';
};

// 导出原始 window.open 供外部使用
export const getOriginalWindowOpen = (): typeof window.open => {
  return savedOriginalWindowOpen || window.open;
};

// 重写window.open方法
let originalWindowOpen: typeof window.open | null = null;
const interceptWindowOpen = (config: InterceptorConfig = {}): (() => void) => {
  const redirectPath = config.redirectPath || '/page-redirect';

  // 保存原始的window.open方法（如果尚未保存）
  if (!originalWindowOpen) {
    originalWindowOpen = window.open;
    // 同时保存到全局变量供重定向页面使用
    savedOriginalWindowOpen = originalWindowOpen;
  }

  // 重写window.open方法
  window.open = function(...args: [string | URL | undefined, string?, string?]): Window | null {
    const [url, target, features] = args;
    if (!url) return originalWindowOpen!.apply(this, args);

    const urlString = url.toString();

    // 使用统一的拦截决策函数
    const action = decideLinkAction(urlString, config);

    switch (action) {
    case 'block':
      // 黑名单链接，阻止访问
      return null;

    case 'intercept':
      // 需要拦截的外部链接，跳转到确认页
      window.location.href = `${redirectPath}?target=${encodeURIComponent(urlString)}`;
      return null;

    case 'allow':
    default:
      // 允许直接访问的链接
      return originalWindowOpen!.call(this, url, target, features);
    }
  };

  // 返回恢复原始方法的函数
  return () => {
    if (originalWindowOpen) {
      window.open = originalWindowOpen;
      originalWindowOpen = null;
      savedOriginalWindowOpen = null;
    }
  };
};

// 拦截链接点击
let isInterceptingClick = false;
const interceptLinkClick = (config: InterceptorConfig = {}): (() => void) => {
  if (isInterceptingClick) {
    // 如果已经添加了事件监听器，直接返回空的清理函数
    return () => {};
  }

  const redirectPath = config.redirectPath || '/page-redirect';

  const handleClick = (e: Event) => {
    // 只处理 a 标签点击
    let target = e.target as HTMLElement | null;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
      if (!target) return;
    }

    const href = target?.getAttribute('href');
    if (!href) return;

    // 使用统一的拦截决策函数
    const action = decideLinkAction(href, config);

    switch (action) {
    case 'block':
      // 黑名单链接，阻止访问
      e.preventDefault();
      e.stopPropagation();
      return;

    case 'intercept':
      // 需要拦截的外部链接，跳转到确认页
      e.preventDefault();
      window.location.href = `${redirectPath}?target=${encodeURIComponent(href)}`;
      return;

    case 'allow':
    default:
      // 允许直接访问的链接，不做任何处理
      return;
    }
  };

  // 使用捕获阶段监听点击事件，这样即使目标元素阻止冒泡也能捕获到事件
  document.addEventListener('click', handleClick, true);
  isInterceptingClick = true;

  // 返回移除事件监听器的函数
  return () => {
    document.removeEventListener('click', handleClick, true);
    isInterceptingClick = false;
  };
};

// 初始化所有拦截器
const initInterceptors = (config: InterceptorConfig = {}): (() => void) => {
  const cleanupWindowOpen = interceptWindowOpen(config);
  const cleanupLinkClick = interceptLinkClick(config);

  // 返回清理函数
  return () => {
    cleanupWindowOpen();
    cleanupLinkClick();
  };
};

// 单独导出各个方法
export {
  isExternal,
  decideLinkAction, // 导出决策函数，便于外部判断链接处理方式
  interceptWindowOpen,
  interceptLinkClick,
  initInterceptors
};
