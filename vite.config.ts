import { defineConfig } from 'vite';
import postcssPresetEnv from 'postcss-preset-env';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    base: './',
    server: {
      port: 1080,
      fs: {
        strict: false
      }
    },
    resolve: {
      alias: {
        '@': '/src',
        '@common': '/src/common',
        '@pages': '/src/pages',
        '@router': '/src/router',
        '@hooks': '/src/hooks'
      }
    },
    css: {
      postcss: {
        plugins: [postcssPresetEnv({
          stage: 2
        })]
      }
    },
    plugins: [
      mode === 'production' && legacy({
        targets: ['chrome >= 64'],

        // 现代浏览器按需 polyfill
        modernPolyfills: true,
        // 传统包额外 polyfill
        additionalLegacyPolyfills: [
          'regenerator-runtime/runtime',
          // 添加基础 polyfill 确保依赖链完整
          'core-js/stable/symbol',
          'core-js/stable/object'
        ],
        // 传统包基础 polyfill
        polyfills: [
          'es.symbol',
          'es.symbol.description',
          'es.object.from-entries',
          'es.array.iterator',
          'es.object.define-property',
          'es.object.define-properties',
          'es.object.get-own-property-descriptor',
          'es.array.includes',
          'esnext.global-this',
          'esnext.string.match-all',
          'es.array.flat-map',
          'es.promise.all-settled',
          'es.object.entries',
          'es.object.values',
          'es.string.iterator',
          'web.dom-collections.iterator'
        ],

        // 确保生成 legacy 包
        renderLegacyChunks: true
      }),
      react()
    ].filter(Boolean),
    build: {
      target: 'es2017',
      minify: 'esbuild', // 比 terser 更快
      cssCodeSplit: true, // 拆分 CSS
      sourcemap: false, // 生产环境禁用 sourcemap
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = path.extname(assetInfo.name || '').toLowerCase();
            if (ext === '.css') {
              return 'css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
          manualChunks(id) {
          }
        },
        external: [] // 可加入你不想打包进来的库，例如 vue、axios，然后用 CDN 引入
      },
      brotliSize: false, // 提高打包速度，禁用体积分析
      chunkSizeWarningLimit: 1000 // 单文件大小警告限制（kb）
    }
  };
});
