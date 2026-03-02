// history.ts
import type { To, NavigateOptions } from 'react-router-dom';

let navigate: (to: To, options?: NavigateOptions) => void;

export const setNavigate = (navFn: typeof navigate) => {
  navigate = navFn;
};

/**
 * 全局跳转方法，支持 replace、state 等参数
 * @param to 要跳转的路径
 * @param options 跳转选项（如 { replace: true, state: {...} }）
 */
export const goTo = (to: To, options?: NavigateOptions) => {
  if (navigate) {
    navigate(to, options);
  } else {
    console.warn('navigate 函数尚未初始化');
  }
};
