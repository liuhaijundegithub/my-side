import { useReactive } from 'ahooks';
import style from './style.module.less';
import { useEffect } from 'react';
import BusinessType from '@/common/alioss/businessType';
import { CommonHTMLAttributes } from 'navyd/dist/types/global';
import { getSignedUrl } from '@/common/alioss';
import { LoadingOutlined } from '@ant-design/icons';
import { Image as AntdImg } from 'antd';
import withIf from '@/common/hoc/withIf';

interface AuthImgProps {
  src: string;
  canPreview?: boolean;
  businessType?: BusinessType;
}

const AuthImg: React.FC<AuthImgProps & CommonHTMLAttributes> = props => {
  const state = useReactive({
    loading: false,
    src: '',
    error: false,
    preview: false
  });

  const load = async () => {
    try {
      state.loading = true;
      if (props.src.includes('prvt')) {
        const val = await getSignedUrl({
          src: props.src,
          ossBusiness: props.businessType
        });
        const img = new Image();
        img.src = val;
        img.onload = () => {
          state.src = val;
        };
        img.onerror = () => {
          state.error = true;
        };
      } else {
        state.src = props.src;
      }
    } catch (e) {
      state.error = true;
      console.error(e);
    } finally {
      setTimeout(() => {
        state.loading = false;
      }, 200);
    }
  };

  const preview = () => {
    if (!props.canPreview) return false;
    state.preview = true;
  };
  useEffect(() => {
    load();
  }, [props.src]);
  return <>
    <div className={style['auth-img']}>
      {
        (() => {
          if (state.error) {
            return <div className={style['error']}>error</div>;
          } else if (state.loading) {
            return <div className={style['loading']}><LoadingOutlined /></div>;
          } else {
            return <div className={style['success']}>
              <img src={state.src} alt="" onClick={preview} />
            </div>;
          }
        })()
      }
    </div>
    {
      props.canPreview && <AntdImg
        preview={{
          visible: state.preview,
          src: state.src,
          onVisibleChange: (visible) => {
            state.preview = visible;
          }
        }}
      />
    }
  </>;
};

export default withIf(AuthImg);