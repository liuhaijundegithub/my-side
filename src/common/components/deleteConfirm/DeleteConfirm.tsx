import { layer, Modal } from 'navyd';
import {DeleteConfirmParmas} from '@common/components/deleteConfirm/index.ts';
import {apiCheckDeleteConfirmStatus} from '@common/components/deleteConfirm/service.ts';
import {useReactive} from 'ahooks';
import {Input} from 'antd';
import md5 from 'md5';
import {useEffect} from 'react';
import style from './DeleteConfirm.module.less';

interface DeleteConfirmProps extends DeleteConfirmParmas {
  close: () => void;
  onSuccess: () => void;
  onFailure: (...args: any[]) => void;
  onLocked: () => void;
}

const DeleteConfirm = (props: DeleteConfirmProps) => {
  const state = useReactive({
    value: '',
    visible: false,
    loading: false,
    showSetPin: false
  });

  const cancel = () => {
    state.visible = false;
    props.close && props.close();
  };
  const onChange = (val: string) => {
    state.value = val;
  };

  const ok = () => {
    if (state.value.length < 6) {
      layer.error('请输入完整的安全验证码');
    } else {
      submit();
    }
  };

  // 提交
  const submit = async () => {
    state.loading = true;
    try {
      if (props.deleteFn) {
        const { data } = await props.deleteFn({
          ...props.params,
          pin: md5(state.value)
        });
        if (data) {
          props.onSuccess && props.onSuccess();
          state.visible = false;
        }
        return true;
      }
    } catch (e) {
      const err = e as any;
      const code = err.bcode as string;
      if (code === 'FAIL') {
        props.close && props.close();
        props.onFailure && props.onFailure(err);
        // 有剩余次数
        return false;
      }
      if (code === 'FREQUENCY') {
        props.close && props.close();
        props.onLocked && props.onLocked();
        // 没有剩余次数
        return false;
      }
      return true;
    } finally {
      state.loading = false;
      cancel();
    }
  };

  // 一开始检查是不是已经被锁定了
  const checkIsLocked = async () => {
    const { bcode } = await apiCheckDeleteConfirmStatus();

    // 没有设置pin
    if (bcode === 'BLANK') {
      layer.confirm({
        title: '提示',
        content: '此操作需要输入安全验证码，您还未设置',
        confirmText: '前往设置',
        cancelText: '关闭',
        onCancel: () => {
          props.close && props.close();
        },
        onConfirm: async () => {
          const url = window.location.origin + '/school/personal-center/security?key=Security';
          window.open(url, 'blank');
          props.close && props.close();
        }
      });
      return false;
    }
    // 已经被锁住了
    if (bcode === 'FREQUENCY') {
      props.close && props.close();
      props.onLocked && props.onLocked();
      return false;
    }
    state.visible = true;
  };

  useEffect(() => {
    checkIsLocked();
  }, []);
  return (
    <>
      <Modal
        open={state.visible}
        title="安全验证"
        onCancel={cancel}
        confirmLoading={state.loading}
        cancelText="取消"
        onConfirm={ok}
        width={450}
      >
        <div className={style['content']}>
          <div className="mb-14">此操作需输入安全验证码</div>
          <div className="flex align-center">
            <div>验证码：</div>
            <Input
              placeholder="请输入"
              className={style['flex1']}
              onChange={e => onChange(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
export default DeleteConfirm;
