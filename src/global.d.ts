import { ColumnType } from 'antd/es/table';
import type { UseTableActionsConfig } from '@/hooks/useTableActions';
import { RouteObject } from 'react-router-dom';
import { UserRole, UserSchool } from './pages/login/service';

declare global {
  type ID = string | number;

  interface BackendData<T = any> {
    bcode: string;
    code: string;
    data: T;
    msg: string;
    headers?: AxiosResponseHeaders;
  }

  interface BackendPaginationData<T = any> extends BackendData {
    data: {
      dataList: T;
      pageNum: number;
      pageSize: number;
      totalCount: number;
      totalPage: number;
    }
  }

  interface UniFileItem {
    name: string;
    src: string;
    uuid?: string;
    size?: number;
    type?: string;
    status?: 'done' | 'fail' | 'uploading';
    progress?: number; // 0-1
  }

  interface LoginRes {
    flag: number;
    simplePrincipal: {
      id: number;
      name: string;
      userType: UserTypeDCode;
      username: string;
      headImageUrl: string;
      mobile: string;
    };
  }

  type UserType = 'TEACHER' | 'STAFF' | 'STUDENT' | 'PARENT' | 'ADMIN' | 'SYSTEM';

  interface UniColumn<T> extends ColumnType<T> {
    actions?: UseTableActionsConfig<T>[];
  }

  type Interval = ReturnType<typeof setInterval> | number;

  type UniRouteObject = {
    path?: string;
    // 没有label时，即被判断为匿名菜单，不在菜单栏中显示
    label?: string;
    icon?: string;
    element?: React.ReactNode;
    children?: UniMenuItem[];
    permission?: string;
    name?: string;
  } & RouteObject;

  type User = {
    permissions: string[];
    roles: UserRole[];
    schools: UserSchool[];
  } & LoginRes['simplePrincipal']

  type StateParams = Record<string, any>;
  type ModalMode = 'add' | 'preview' | 'edit';
  type ManaModalContentCommon<T = StateParams, D = any> = {
    mode: ModalMode;
    impale: (props: { submit: () => Promise<unknown> | unknown; cancel: () => Promise<unknown> | unknown }) => void;
    form: FormInstance;
    FormItem: React.FC<FormItemProps>;
    FormList: React.FC<FormListProps>;
    defaultValue: T;
    modalProps: D
  };
  type Option = { label: string, value: ID };
}