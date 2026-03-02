// 遍历routes，更新每个元素的path为当前path加上父级path
import { cloneDeep, flatten } from 'lodash';

const updateRoutesWithFullPath = (routes: UniRouteObject[], parentRoute: UniRouteObject): UniRouteObject[] => {
  return routes.map(route => {
    const updatedRoute: UniRouteObject = {
      ...route
    };

    // 更新当前路由的path
    if (route.index) {
      updatedRoute.path = parentRoute.path;
    } else if (route.path) {
      updatedRoute.path = parentRoute.path + (route.path.startsWith('/') ? route.path : `/${route.path}`);
    }

    // 如果有子路由，递归处理
    if (route.children && route.children.length > 0) {
      updatedRoute.children = updateRoutesWithFullPath(route.children, updatedRoute);
    }

    return updatedRoute;
  });
};

// routes 扁平化
const flattenRoutes = (routes: UniRouteObject[]): UniRouteObject[] => {
  // 递归处理
  return flatten(routes.map(route => {
    return route.children ? [route, ...flattenRoutes(route.children)] : [route];
  })) as UniRouteObject[];
};


// 获取处理过的路由
export const getRoutes = (routes: UniRouteObject[]): UniRouteObject[] => {
  const routesWithFullPath: UniRouteObject[] = updateRoutesWithFullPath(cloneDeep(routes), { path: '' });
  return flattenRoutes(routesWithFullPath);
};


// 正则匹配格式【 /:xxx 】，获取path中的所有参数
export const extractPathParams = (path: string): string[] => {
  const regex = /:([^/]+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(path)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// 精确匹配路由
export const findExactRoute = (pathname: string, allRoutes: UniRouteObject[]): UniRouteObject | undefined => {
  // 首先尝试精确匹配
  for (const route of allRoutes) {
    if (!route.path) continue;

    // 将路由路径中的参数占位符替换为通配符，创建匹配模式
    const routePattern = route.path.replace(/:([^/]+)/g, '([^/]+)');
    const regex = new RegExp(`^${routePattern}$`);

    if (regex.test(pathname)) {
      return route;
    }
  }

  // 如果没有精确匹配，尝试匹配父级路由（针对index路由）
  for (const route of allRoutes) {
    if (!route.path) continue;

    // 对于以 / 结尾的路径，检查是否匹配去掉结尾斜杠的路径
    if (route.path.endsWith('/') && pathname === route.path.slice(0, -1)) {
      return route;
    }
  }

  return undefined;
};
