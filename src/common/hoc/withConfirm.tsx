import {layer} from 'navyd';
import React from 'react';
type LayerConfirmOptions = Parameters<typeof layer.confirm>[0];
type WithConfirmOptions = Omit<LayerConfirmOptions, 'onConfirm' | 'title'> & {
  title?: React.ReactNode;
};

function withConfirm<T, S extends any[]>(fn: (...args: S) => Promise<T>, options: WithConfirmOptions) {
  const func = (...args: S) => new Promise<T>((resolve, reject) => {
    layer.confirm({
      title: '提示',
      ...options,
      onConfirm: async () => {
        try {
          const res = await fn(...args);
          resolve(res);
          layer.msg('操作成功');
        } catch (error) {
          reject(error);
          return Promise.reject(error);
        }
      }
    });
  });
  return func;
}

export default withConfirm;