import usePermission from '@/hooks/usePermission';


interface AuthorizationProps {
  children: React.ReactNode;
  code?: string | string[];
  // 如果code为数组时候，type为some表示只要有一个权限满足就显示，为every表示所有权限都满足才显示
  // 默认 = some
  type: 'some' | 'every';
}
const Authorization: React.FC<AuthorizationProps> = props => {
  const hasPermission = usePermission();
  const { code, children, type = 'some' } = props;
  return hasPermission(code!, type) ? children : null;
};

export default Authorization;