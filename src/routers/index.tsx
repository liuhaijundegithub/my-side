import {
  HashRouter,
  BrowserRouter,
  useLocation,
  useRoutes,
  useNavigate
} from 'react-router-dom';

import routes from './routes';
import uniConfig from '@/config';
import { setNavigate } from '@/utils/history';
import useLogin from '@/hooks/useLogin';
import usePermission from '@/hooks/usePermission';
import useRouter from '@/hooks/useRouter';

const Routes = function () {

  const { isLogin } = useLogin();
  const router = useRouter();

  // TODO 需要做token存在校验的时候需要打开
  // useEffect(() => {
  //   if (!isLogin && !uniConfig.whiteList.some(i => location.pathname.includes(i))) {
  //     router.to({ path: '/' });
  //   }
  // }, [isLogin]);

  const location = useLocation();

  const hasPermission = usePermission();

  const filterRouteByPermission = (list: typeof routes): typeof routes => {
    return list.
      filter(i => {
        return hasPermission(i.permission);
      })
      .map(item => {
        if (item.children && item.children.length > 0) return {
          ...item,
          children: filterRouteByPermission(item.children)
        };
        return item;
      });
  };

  return useRoutes(filterRouteByPermission(routes));
};


const NavigationSetter = () => {
  const navigate = useNavigate();
  setNavigate(navigate);
  return null;
};

const Router = () => {
  // 根据 uniConfig 中的 routerType 配置来决定使用哪种路由方式
  // 如果 routerType 是 'hash'，则使用 HashRouter，否则使用 BrowserRouter
  return uniConfig.routerType === 'hash' ?
    <HashRouter>
      {/* 嵌入hack naivate 方法，解决 router方法不能在非Function场景下使用问题 */}
      <NavigationSetter />
      <Routes />
    </HashRouter> :
    <BrowserRouter>
      <NavigationSetter />
      <Routes />
    </BrowserRouter>;
};

export default Router;
