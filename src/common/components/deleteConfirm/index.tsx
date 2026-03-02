import { layer } from 'navyd';
import {ConfigProvider} from 'antd';
import config from '@/config';
import {createRoot} from 'react-dom/client';
import DeleteConfirm from './DeleteConfirm';

export interface DeleteConfirmParmas {
  deleteFn: (params?: any) => Promise<BackendData>;
  params: Record<string, any>;
}

class DeleteConfirmModal {
  private successCallBack: (() => void) | undefined;
  private failureCallBack: ((e: any) => void) | undefined;
  private params: DeleteConfirmParmas | undefined;

  private async init (params: DeleteConfirmParmas) {
    const div = document.createElement('div');
    div.id = 'deleteConfirmWrapper';
    div.classList.add('uni-shadow-mask');
    div.classList.add('uni-shadow-mask-alert');
    div.classList.add('show');
    document.body.appendChild(div);

    const close = () => {
      const el = document.getElementById('deleteConfirmWrapper');
      el && document.body.removeChild(el);
    };

    // 验证成功
    const onSuccess = async () => {
      // 是否注册了成功事件 没有默认给个简单提示
      if (this.successCallBack) {
        await this.successCallBack();
      } else {
        layer.msg('删除成功');
      }
    };

    // 验证失败了
    const onFailure = (e: any) => {
      layer.confirm({
        title: '验证失败',
        content: e.msg,
        confirmText: '再试一次',
        cancelText: '取消',
        onConfirm: async () => {
          this.init(this.params as DeleteConfirmParmas);
        }
      });
    };

    // 锁了
    const onLocked = () => {
      layer.confirm({
        title: '验证失败',
        content: '验证码错误次数超多限制, 已被临时锁定无法操作, 请10分钟后再试',
        confirmText: '好的'
      });
    };

    const root = createRoot(div);
    const props = {
      close,
      deleteFn: params.deleteFn,
      params: params.params,
      onSuccess: onSuccess,
      onLocked: onLocked,
      onFailure: onFailure.bind(this)
    };
    root.render(
      <ConfigProvider
        theme={config.antdTheme}
      >
        <DeleteConfirm {...props}></DeleteConfirm>
      </ConfigProvider>
    );
  }

  constructor (params: DeleteConfirmParmas) {
    this.params = params;
    this.init(params);
  }

  on (type: 'success' | 'failure', fn: (...args: any[]) => void) {
    if (type === 'success') this.successCallBack = fn;
    if (type === 'failure') this.failureCallBack = fn;
  }
}

export default DeleteConfirmModal;
