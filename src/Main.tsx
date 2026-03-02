import 'core-js/stable';
import ReactDom from 'react-dom/client';
import './common/style/reset.css';
import './common/style/utils.less';
import './common/style/hacker.less';

import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import uniConfig from '@/config';
import { ConfigProvider as UniConfigProvider } from 'navyd';
import { StyleProvider, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';

import App from './App';
import 'navyd/dist/css/index.css';
import { initInterceptors } from './utils/externalLinkInterceptor.ts';
import { useThemeStore } from './store/themeStore';

// 初始化外部链接拦截器（使用配置文件中的配置）
// 注意：此拦截器将在应用整个生命周期内运行，直到页面关闭
// 因此返回的清理函数不需要显式调用（页面关闭时浏览器会自动清理）
initInterceptors(uniConfig.externalLinkInterceptor || {});

const container = document.querySelector('#root')!;
const root = ReactDom.createRoot(container);

const Root = function () {
  const mode = useThemeStore((state) => state.mode);
  const isDark = mode === 'dark';

  const currentTheme = isDark ? {
    ...uniConfig.antdDarkTheme,
    algorithm: antdTheme.darkAlgorithm
  } : uniConfig.antdTheme;

  return (
    <ConfigProvider
      theme={currentTheme}
      locale={zhCN}
    >
      <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
        <UniConfigProvider
          mainColor={uniConfig.antdTheme.token?.colorPrimary}
        >
          <App />
        </UniConfigProvider>
      </StyleProvider>
    </ConfigProvider>
  );
};

root.render(<Root />);
