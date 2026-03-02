import { RouteObject } from 'react-router-dom';
import Permission from './Permission';
const generateAuthRoute = (props: GenerateAuthRouteProps) => {
  return {
    path: 'auth-management',
    element: <Permission
      {...props}
    />
  } as RouteObject;
};

export default generateAuthRoute;