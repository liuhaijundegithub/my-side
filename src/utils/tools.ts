/* eslint-disable no-new */
import { v4 } from 'uuid';
import { layer } from 'navyd';
import Compressor from 'compressorjs';

export const getuuid = () => {
  return v4().replaceAll('-', '');
};

/**
 * 拷贝文字到剪切板
 * @param {string} text
 */

export function copy2Clipboard (text: string) {
  const inputEl = document.createElement('input');
  inputEl.value = text;
  document.body.appendChild(inputEl);
  try {
    inputEl.select();
    if (document.execCommand('copy')) {
      layer.msg('复制成功');
      return true;
    }
  } catch (error) {
    layer.warn('设备暂不支持自动复制，请手动复制');
    return false;
  } finally {
    document.body.removeChild(inputEl);
  }
}


export const isImgFile = function (type: string) {
  return ['png', 'jpg', 'jpeg'].includes(type.toLocaleLowerCase());
};

export const compressImage = async (file: File, options?: Compressor.Options) => {
  const COMPRESS_OPTIONS = {
    maxSizeMB: 0.1, // 图片最大size: MB,
    maxWidthOrHeight: 1200,
    ...options
  };
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      convertTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'],
      convertSize: COMPRESS_OPTIONS.maxSizeMB * 1024 * 1024,
      maxWidth: COMPRESS_OPTIONS.maxWidthOrHeight,
      maxHeight: COMPRESS_OPTIONS.maxWidthOrHeight,
      success: (res) => {
        resolve(res as File);
      },
      error: (err) => {
        console.error('压缩失败', err);
        reject(err);
      }
    });
  }) as Promise<File>;
};