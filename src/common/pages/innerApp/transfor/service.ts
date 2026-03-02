import service from '@/common/ajax';
import config from '@/config';

// 获取用户信息
export const getUserInfo = () =>
  service<BackendData<LoginRes>>('basicdata/common/loginuserinfo', { ifToastErrorMsg: false });


interface AppInfo {
  id: ID;
  name: string;
  icon: string;
  applicationVersion: string;
  webUrl: string;
  h5Url: string;
}
export const getAppInfo = () =>
  service<BackendData<AppInfo>>(`${config.urlPrefix}/common/appinfo/schoolappinfo`);