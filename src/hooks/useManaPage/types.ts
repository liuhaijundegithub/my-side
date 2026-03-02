import { TabProps } from './tabs/Tabs';
import { JSX } from 'react';
import { SearchPanelProps } from './searchPanel/SearchPanel';
import type { ButtonProps } from 'antd';
import { TitleProps } from './title/Title';
import { TipProps } from './tip/Tip';
import type { FormProps } from 'antd';


export type PageConfig = Array<
  { type: 'tab', props: TabProps, children?: { [key: string]: () => JSX.Element } } |
  { type: 'title', props: TitleProps } |
  {
    type: 'tip',
    props: TipProps
  } |
  { type: 'search-panel', props: SearchPanelProps } |
  {
    type: 'table',
    props?: {
      page?: boolean | number,
      select?: boolean,
      showIndex?: boolean
    }
  } |
  {
    type: 'modal',
    props?: {
      title?: React.ReactNode;
      layout?: 'horizontal' | 'vertical';
      modifyPermission?: string;
    }
  } |
  {
    type: 'actions',
    props: {
      type: ButtonProps['type']
      text: string;
      onClick: () => void | Promise<void>;
    }
  } |
  {
    type: 'custom',
    props?: React.FC
  }
>;

export interface UseManaPageProps<T> {
  config: PageConfig;
  extraSearchParmas?: StateParams;
  columns?: UniColumn<T>[];
  ModalContent?: React.FC<any>;
  tableEmptyContent?: React.ReactNode;
  onTabChange?: (key: string) => void;
  serviceFn?: (...args: any[]) => Promise<BackendData<T[]> | BackendPaginationData<T[]>>;
  onSearchParamsChange?: (params: StateParams, fieldName: string, value: any) => void;
  onRowSelectionChange?: (keys: React.Key[]) => void;
  onStateReady?: () => void;
  onModalSave?: (mode: ModalMode, data: any) => void | Promise<any>;
  modalProps?: unknown;
  wrapByCard?: boolean;
  modalFormProps?: FormProps;
  modalWidth?: number;
  onChildLoad?: (key: string) => any;
}
