import { PageConfig, UseManaPageProps } from './types';
import Tab, { TabProps } from './tabs/Tabs';
import { cloneDeep, debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useReactive } from 'ahooks';
import SearchPanel, { SearchPanelForm, SearchPanelProps } from './searchPanel/SearchPanel';
import UniTable, { UniTableProps } from '@/common/components/table/Table';
import UniModal from './modal/Modal';
import Title, {TitleProps} from './title/Title';
import { Form as AntdForm } from 'antd';
import Actions, {PageActions} from './actions/Actions';
import Tip, {TipProps} from './tip/Tip';
import usePermission from '../usePermission';
import style from './style.module.less';
import { CommonHTMLAttributes } from 'navyd/dist/types/global';
import evt from './events';

interface PageState<T> {
  tab: TabProps;
  searchPanel: SearchPanelProps;
  table: UniTableProps<T>;
  modal: {
    title: React.ReactNode;
    open: boolean;
    loading: boolean;
    mode: ModalMode;
    submitFormFn: () => Promise<unknown> | unknown;
    cancelFn: () => void;
    defaultValue: StateParams;
    layout: 'horizontal' | 'vertical';
    modifyPermission?: string;
    width: number;
  },
  title: TitleProps;
  tip: TipProps;
  custom: {
    props: React.FC;
  }
}

// 定义一个usePageState函数，用于处理页面状态
function usePageState<T> (props: UseManaPageProps<T>) {
  const {
    config,
    onTabChange,
    onSearchParamsChange,
    columns = [],
    serviceFn,
    extraSearchParmas = {},
    ModalContent,
    onModalSave,
    modalProps = {},
    tableEmptyContent,
    wrapByCard = true,
    modalFormProps = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    },
    modalWidth
  } = props;

  const hasPermission = usePermission();

  const [pageConfig] = useState(cloneDeep(config));

  const getPageState = (c: PageConfig) => {
    const s = cloneDeep(c).reduce((a: PageState<T>, c) => {
      if (c.type === 'search-panel') {
        a.searchPanel = c.props;
      }
      if (c.type === 'tab') {
        c.props.items = c.props.items.filter(i => hasPermission(i.permission!));
        a.tab = c.props;
      }
      if (c.type === 'table') {
        const page = c.props?.page;
        a.table = {
          selectedKeys: c.props?.select ? [] : undefined,
          list: [],
          columns,
          pagination: page ? {
            current: 1,
            pageSize: typeof page === 'boolean' ? 20 : page,
            total: 0
          }: undefined,
          showIndex: c.props?.showIndex,
          emptyProp: tableEmptyContent
        };
      }
      if (c.type === 'modal') {
        a.modal = {
          title: c.props?.title,
          open: false,
          loading: false,
          mode: 'add',
          submitFormFn: () => undefined,
          cancelFn: () => undefined,
          defaultValue: {},
          layout: c.props?.layout || 'vertical',
          modifyPermission: c.props?.modifyPermission,
          width: modalWidth || 560
        };
      }
      if (c.type === 'title') {
        a.title = c.props;
      }
      if (c.type === 'tip') {
        a.tip = c.props;
      }
      if (!a.searchPanel) {
        a.searchPanel = { items: [] };
      }
      if (c.type === 'custom') {
        a.custom = {
          props: c.props!
        };
      }
      return a;
    }, {} as PageState<T>);
    return s;
  };


  const state = useReactive<PageState<T>>(getPageState(pageConfig));

  // tabChange
  const tabChange = (key: string) => {
    state.tab.activeKey = key;
    onTabChange && onTabChange(key);
  };

  const Children = useMemo(() => {
    const tabConfig = props.config.find(i => i.type === 'tab');
    if (tabConfig && tabConfig.children) return tabConfig.children[state.tab.activeKey!] || null;
    return null;
  }, [state.tab?.activeKey]);

  const load = async () => {
    if (!serviceFn) {
      return Promise.resolve([]);
    }
    try {
      if (state.table.pagination && state.searchPanel.params) {
        (state.searchPanel.params as StateParams)['pageNum'] = state.table.pagination.current;
        (state.searchPanel.params as StateParams)['pageSize'] = state.table.pagination.pageSize;
      }
      state.table.loading = true;
      const params = state.searchPanel ? state.searchPanel.params : {};
      const { data } = await serviceFn({ ...params, ...extraSearchParmas });
      if (data instanceof Array) {
        // 没有分页
        state.table.list = data as T[];
      } else {
        const d = data as BackendPaginationData['data'];
        state.table.list = d.dataList;
        if (state.table.pagination) {
          state.table.pagination.total = d.totalCount;
          if (state.table.pagination.current && state.table.pagination.current > d.totalPage && d.totalCount > 0) {
            state.table.pagination.current = d.totalPage;
            load();
          }
        }
      }
      return state.table.list;
    } finally {
      state.table.loading = false;
    }
  };

  const init = async () => {
    if (state.searchPanel) {
      state.searchPanel.params = state.searchPanel.items.reduce((a: StateParams, i) => {
        if (React.isValidElement(i)) return a;
        const c = i as SearchPanelForm;
        if (Array.isArray(c.defaultValue)) {
          a[c.name + 'StartDt'] = c.defaultValue[0];
          a[c.name + 'EndDt'] = c.defaultValue[1];
        } else {
          a[c.name] = c.defaultValue;
        }
        return a;
      }, {});
    }
    if (state.tab && !state.tab.activeKey) {
      state.tab.activeKey = state.tab.items[0].key;
    }
    load();
  };
  const search = debounce(() => {
    console.log('search');
    if (state.table?.pagination?.current) {
      state.table.pagination.current = 1;
    }
    load();
  }, 300, { leading: true });
  const fieldChange = (p: StateParams, name: string, value: any) => {
    (state.searchPanel.params as StateParams)[name] = value;
    onSearchParamsChange && onSearchParamsChange(p, name, value);
    search();
  };

  const pageChange = (current: number, pageSize: number) => {
    if (state.table.pagination) {
      state.table.pagination.current = current;
      state.table.pagination.pageSize = pageSize;
      load();
    }
  };

  const model = useReactive({
    hasPreviewMode: false,
    defaultValue: {} as any
  });

  const openModal = (mode: ModalMode = 'add', defaultValue?: StateParams) => {
    // model.hasPreviewMode = mode === 'preview';
    if (mode === 'preview') model.hasPreviewMode = true;
    if (defaultValue) {
      state.modal.defaultValue = cloneDeep(defaultValue);
      model.defaultValue = cloneDeep(defaultValue);
    }
    state.modal.open = true;
    state.modal.mode = mode;
  };

  const closeModal = () => {
    state.modal.cancelFn();
    state.modal.open = false;
    model.hasPreviewMode = false;
  };

  // 定义一个函数，用于关闭抽屉
  const modalClose = () => {
    closeModal();
  };

  const onDrawerCancelEdit = () => {
    if (model.hasPreviewMode) {
      openModal('preview', model.defaultValue);
    } else {
      closeModal();
    }
  };

  const setSearchParams = (name: string, value: any) => {
    if (state.searchPanel && state.searchPanel.params) {
      state.searchPanel.params[name] = value;
      onSearchParamsChange && onSearchParamsChange(state.searchPanel.params, name, value);
    }
  };

  const setColumns = (columns: UniTableProps['columns']) => {
    state.table.columns = columns;
  };

  const setTabItem = (key: string, label: React.ReactNode) => {
    const item = state.tab.items.find(i => i.key === key);
    if (item) item.label = label;
  };

  const setTabItems = (items: TabProps['items']) => {
    if (state.tab) state.tab.items = items;
  };


  useEffect(() => {
    init();
  }, []);

  const Page = (props: CommonHTMLAttributes & { actions?: React.ReactNode }) => {
    const impale: ManaModalContentCommon['impale'] = props => {
      state.modal.submitFormFn = props.submit;
      state.modal.cancelFn = props.cancel;
    };
    const modalSave = async () => {
      try {
        state.modal.loading = true;
        const formData = await state.modal.submitFormFn();
        (formData && onModalSave) && await onModalSave(state.modal.mode, formData);
        modalClose();
      } catch (e) {
        console.log('useManaPage/index.tsx:', e);
      } finally {
        state.modal.loading = false;
      }
    };

    const onDrawerModeChange = (mode: ModalMode) => {
      state.modal.mode = mode;
    };
    const [form] = AntdForm.useForm();
    const FormItem = AntdForm.Item;
    const FormList = AntdForm.List;

    const modalTitle = useMemo(() => {
      if (!state.modal) return false;
      const { mode, title } = state.modal;
      if (mode === 'preview') return '详情';
      else return mode === 'add' ? `新增${title}` : `修改${title}`;
    }, [state.modal?.title, state.modal?.mode]);

    return <div className={style['use-mana-page-wrapper']}>
      {
        pageConfig.map(i => {
          if (i.type === 'tab') return <Tab
            key={i.type}
            { ...state.tab }
            onChange={tabChange}
            className="use-mana-page-item"
          />;

          if (i.type === 'title') return <Title
            key={i.type}
            className="use-mana-page-item"
            { ...state.title }
          />;

          if (i.type === 'tip') return <Tip key={i.type} { ...state.tip } className="use-mana-page-item" />;

          if (i.type === 'custom') {
            const C = state.custom.props;
            return C && <C key={i.type} />;
          }

          if (i.type === 'search-panel') return <SearchPanel
            key={i.type}
            { ...state.searchPanel }
            onSearch={search}
            onFieldChange={fieldChange}
            className="use-mana-page-item"
            actions={props.actions}
          />;

          if (i.type === 'table') return <UniTable
            key={i.type}
            { ...state.table }
            onPagechange={pageChange}
            className="use-mana-page-item"
          />;

          if (i.type === 'modal') return <UniModal
            key={i.type}
            { ...state.modal }
            mode={state.modal.mode}
            onCancel={modalClose}
            onSave={modalSave}
            onModeChange={onDrawerModeChange}
            onCancelEdit={closeModal}
            title={modalTitle}
          >
            {
              ModalContent && <AntdForm
                form={form}
                layout={state.modal.layout}
                { ...modalFormProps }
              >
                <ModalContent
                  FormItem={FormItem}
                  FormList={FormList}
                  form={form}
                  mode={state.modal.mode}
                  defaultValue={state.modal.defaultValue}
                  impale={impale}
                  modalProps={modalProps}
                />
              </AntdForm>
            }
          </UniModal>;
        })
      }
      {
        Children && <Children />
      }
      { props.children }
    </div>;
  };

  return {
    Page: useCallback(Page, [props.config, Children]),
    state,
    openModal,
    closeModal,
    load,
    setSearchParams,
    setColumns,
    setTabItem,
    setTabItems,
    evt
  };
}

function useActions (config: (PageActions | React.FC)[]) {
  return () => <Actions config={config} />;
}

export default usePageState;
export { useActions };
export type { PageActions, PageConfig };
