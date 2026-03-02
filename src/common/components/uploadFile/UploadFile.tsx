import style from './style.module.less';
import { layer } from 'navyd';
import { PlusOutlined, LoadingOutlined, CheckCircleFilled, LinkOutlined, CloseCircleFilled, CloseOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { Spin, Button } from 'antd';
import { getuuid } from '@/utils/tools';
import { uploadFileToAlioss } from '@/common/alioss';
import BusinessType from '@/common/alioss/businessType';
import { useReactive } from 'ahooks';
import withIf from '@/common/hoc/withIf';
import { CommonHTMLAttributes } from 'navyd/dist/types/global';

export interface UploadFileProps {
  // 选择文件按钮文案
  buttonText?: string;
  // 如果有children, 则不显示默认的选择文件按钮
  children?: React.ReactNode;
  // 上传文件的提示语
  tip?: React.ReactNode;
  list?: UniFileItem[];
  // 最大的数量
  max?: number;
  // 单个文件最大容量
  maxSize?: number; // 单位M
  businessType: BusinessType;
  accepts: string[];
  onFileChange?: (list: UniFileItem[]) => void;
}

const UploadFile: React.FC<UploadFileProps & CommonHTMLAttributes> = props => {
  const state = useReactive({
    list: [] as UniFileItem[]
  });
  useEffect(() => {
    state.list = props.list?.map(i => ({ ...i, uuid: getuuid() })) || [];
  }, [props.list]);
  const {
    accepts = [],
    maxSize = 10,
    max = 10
  } = props;

  const addFile = async (file: File) => {
    const item: UniFileItem = {
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || '',
      status: 'uploading',
      src: '',
      progress: 0,
      uuid: getuuid()
    };
    state.list.push(item);
    try {
      const src = await uploadFileToAlioss({
        businessType: props.businessType,
        file,
        callback: (progress: number) => {
          item.progress = progress;
          state.list.pop();
          state.list.push(item);
        }
      });
      state.list = state.list.map(i => {
        if (i.uuid === item.uuid) {
          i.src = src;
          i.status = 'done';
          return i;
        } else return i;
      });
      props.onFileChange && props.onFileChange(state.list);
    } catch {
      state.list = state.list.map(i => {
        if (i.uuid === item.uuid) {
          i.status = 'fail';
          return i;
        } else return i;
      });
      props.onFileChange && props.onFileChange(state.list);
    }
  };

  const click = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', accepts.map(i => `.${i}`).toString());
    input.click();
    input.onchange = (e: any) => {
      const file = e.target.files[0] as File;
      const fileType = file.name.split('.').pop()!;
      if (file.size > maxSize * 1024 * 1024) {
        layer.error(`文件大小不可超过${props.maxSize}M`);
      } else if (!accepts.includes(fileType)) {
        layer.error(`当前不支持 [.${fileType}] 文件，请重新上传`);
      } else {
        addFile(file);
      }
    };
  };

  const removeItem = (uuid: string) => {
    const list = state.list.filter(i => i.uuid !== uuid);
    state.list = list;
    props.onFileChange && props.onFileChange(list);
  };

  const buttonDisabled = useMemo(() => {
    return max === state.list?.length || state.list?.some(i => i.status === 'uploading');
  }, [state.list, max]);

  return (
    <div className={style['upload-file']}>
      <div className={style['upload-header']}>
        {
          props.children ? props.children : <Button
            onClick={click}
            disabled={buttonDisabled}
            className="flex-center"
          >
            <PlusOutlined className="main" />
            {props.buttonText || '选择文件'}
          </Button>
        }
      </div>
      {/* tip */}
      { props.tip && props.tip }
      {/* 文件展示区 */}
      <div className={style['file-list']}>
        {
          state.list.map(i =>
            <div key={i.uuid}>
              {
                (() => {
                  if (i.status === 'uploading') return <Spin
                    className={style['file-icon']}
                    indicator={<LoadingOutlined style={{ fontSize: 18 }} spin/>}
                  />;
                  if (i.status === 'done') {
                    return <CheckCircleFilled className="mr-5 main"/>;
                  }
                  if (i.status === 'fail') return <CloseCircleFilled className="mr-5 red" />;
                  return <LinkOutlined type="icon-ic_appendix" className="mr-5"/>;
                })()
              }
              <span>{i.name}</span>
              {/* 上传期间不可以删除 */}
              {
                i.status !== 'uploading' &&
                  <CloseOutlined
                    className={style['delete-item']}
                    onClick={() => removeItem(i.uuid!)}
                  />
              }
              {/* 上传中 */}
              {
                i.status === 'uploading' && <div className={style['bar']}>
                  <div style={{ width: `${(i.progress || 0) * 100}%` }}></div>
                </div>
              }
            </div>
          )
        }
      </div>
    </div>
  );
};

export default withIf(UploadFile);

