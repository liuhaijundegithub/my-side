import BusinessType from '@/common/alioss/businessType';
import style from './style.module.less';
import classnames from 'classnames';
import { CameraFilled, LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useReactive } from 'ahooks';
import { layer } from 'navyd';
import { getuuid, isImgFile } from '@/utils/tools';
import { uploadFileToAlioss } from '@/common/alioss';
import { AuthImg } from '@/common/components';
import withIf from '@/common/hoc/withIf';

interface UploadImgProps {
  businessType: BusinessType;
  size?: 'small' | 'normal';
  max?: number;
  maxSize?: number;
  list?: UniFileItem[];
  onImgChange?: (ImgList: UniFileItem[]) => void;
}

const UploadImg: React.FC<UploadImgProps & Partial<React.HTMLAttributes<HTMLDivElement>>> = props => {
  const {
    businessType,
    size = 'normal',
    max = 10,
    maxSize = 10 * 1024 * 1024,
    className,
    onImgChange,
    ...rest
  } = props;

  const state = useReactive({
    loading: false,
    list: [] as UniFileItem[]
  });

  useEffect(() => {
    state.list = props.list?.map(i => ({ ...i, uuid: getuuid() })) || [];
  }, [props.list]);

  const addFile = async (file: File) => {
    try {
      state.loading = true;
      const src = await uploadFileToAlioss({
        businessType,
        file
      });
      const item: UniFileItem = {
        name: file.name,
        src,
        uuid: getuuid()
      };
      state.list.push(item);
      onImgChange && onImgChange(state.list);
    } catch {
      layer.error('上传失败');
    } finally {
      state.loading = false;
    }
  };

  const selectFile = () => {
    if (state.loading) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0] as File;
      // 开始判断
      const fileType = file.name.split('.').pop()!;
      if (file.size > maxSize * 1024 * 1024) {
        layer.error(`文件大小不可超过${props.maxSize}M`);
      } else if (!isImgFile(fileType)) {
        layer.error(`当前不支持 [.${fileType}] 文件，请重新上传`);
      } else {
        addFile(file);
      }
    };

    input.click();
  };

  const removeImg = (uuid: string) => {
    const index = state.list.findIndex(i => i.uuid === uuid);
    state.list.splice(index, 1);
    props.onImgChange && props.onImgChange(state.list);
  };

  return (
    <div
      className={classnames(style['uni-upload-img'], className)}
      { ...rest }
    >
      {
        state.list.length < max && <div
          className={classnames(style[size], style['btn'], 'mb-10')}
          onClick={selectFile}
        >
          {
            state.loading ? <LoadingOutlined className={classnames(style['upload-icon'])} /> :
              <CameraFilled className={classnames('grey', style['upload-icon'])} />
          }
        </div>
      }
      {/* 图片 */}
      <div className={style['img-list']}>
        {
          state.list.map(i => (
            <div
              key={i.uuid}
              className={style[size]}
            >
              <AuthImg src={i.src} businessType={props.businessType} canPreview />
              <div
                className={classnames(style['remove-img-icon'], 'pointer')}
                onClick={() => removeImg(i.uuid!)}
              >
                <CloseOutlined />
              </div>
            </div>
          ))
        }
      </div>
    </div>

  );
};

export default withIf(UploadImg);