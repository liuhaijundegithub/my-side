import useRouter from '@/hooks/useRouter';
import { useEffect } from 'react';
import { getUserInfo, getAppInfo } from './service';
import { layer } from 'navyd';

const Authorization = () => {
  const router = useRouter();
  const { t, sid, aid } = router.getSearchParams();

  useEffect(() => {
    // t && localStorage.setItem('accessToken', t);
    // sid && localStorage.setItem('sid', sid);
    // aid && localStorage.setItem('aid', aid);
    getUserInfo()
      .then(async res => {
        // 加载应用设置
        await getAppInfo();

        const { userType } = res.data.userPrincipal;
        // 判断用户类型
        if (userType === 'TEACHER') {
          const schoolInfo = res.data.userSchoolInfos.find(el => el.schoolId === Number(sid));
          // schoolInfo && setSchoolInfo(schoolInfo);
          // setPermissions().then(() => {
          //   router.to({ path: '/home', navigateOptions: { replace: true } });
          // });
        } else if (userType === 'ADMIN') {
          // 后台管理员
          const schollInfoString = localStorage.getItem('ADMIN_MANAGE_SCHOOL_INFO');
          if (schollInfoString) {
            const schoolInfo = JSON.parse(schollInfoString as string);
            // setSchoolInfo(schoolInfo);
            // setPermissions().then(() => {
            //   router.to({ path: '/home', navigateOptions: { replace: true } });
            // });
          } else {
            layer.alert({
              title: '提示',
              content: '请从校务管理进入学校应用'
            });
          }
        } else {
          // 其他用户
          layer.alert({
            title: '提示',
            content: '您没有权限访问该页面'
          });
        }
      })
      .catch(() => {
        // 登录失败 自己去登录吧
        layer.alert({
          title: '提示',
          // content: '授权失败，请手动登录',
          content: '数据出错，请向应用管理员反馈',
          onConfirm: () => {
            if (import.meta.env.MODE === 'development') {
              // 登录失败的操作
              router.to({ path: '/login', navigateOptions: { replace: true } });
            } else {
              location.href = `${location.origin}/landing/login`;
            }
          }
        });
        localStorage.clear();
      });
  }, []);
  return (
    <div className="h-full flex-center grey">
      跳转中，请稍后······
    </div>
  );
};

export default Authorization;
