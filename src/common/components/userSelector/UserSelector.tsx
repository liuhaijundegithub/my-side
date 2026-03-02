import style from './style.module.less';
import { Input, Button } from 'antd';
import { Table } from '@/common/components';
import { useReactive } from 'ahooks';
import { useEffect, useMemo } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import withIf from '@/common/hoc/withIf';
import { ColumnsType } from 'antd/es/table';

export interface User extends StateParams {
  id: ID;
  name: string;
}
type Field<T = any> = ColumnsType<T>;

export interface UserSelectorProps {
  querys?: { type: 'input', name: 'nameLikeOrMobile' }[]; // search grade course position
  placeholder?: string;
  onUserChange?: (users: User[]) => void;
  defaultSelected?: StateParams[];
  disableSelectedChecked?: boolean;
  disabledSelected?: StateParams[];
  serviceFn: (...args: any) => Promise<BackendPaginationData<User[]>> | Promise<BackendData<User[]>>;
  fields: Field;
  rowKey?: string;
}

const UserSelector: React.FC<UserSelectorProps> = props => {
  const model = useReactive({
    loading: false,
    list: [] as User[],
    params: {
      pageNum: 1,
      pageSize: 20
    } as StateParams,
    totalPage: 0,
    selected: [] as User[]
  });
  const {
    querys = [],
    placeholder = '请输入用户姓名/平台账号/手机号码',
    fields = [],
    disableSelectedChecked = true,
    rowKey = 'id'
  } = props;

  const loadTableList = async () => {
    if (!props.serviceFn) return;
    try {
      model.loading = true;
      const { data } = await props.serviceFn(model.params);
      if (Array.isArray(data)) {
        model.list = data;
      } else {
        if (model.params.pageNum === 1) {
          model.list = data.dataList;
        } else {
          model.list = [...model.list, ...data.dataList];
        }
        model.totalPage = data.totalPage;
      }
    } finally {
      model.loading = false;
    }
  };

  const columns = useMemo(() => {
    return fields;
  }, [fields]);

  const search = () => {
    model.params.pageNum = 1;
    loadTableList();
  };

  // 选择变化
  const onSelectChange = (_: User[], changeRecord: User[], flag: boolean) => {
    if (flag) {
      model.selected = [...model.selected, ...changeRecord];
    } else {
      model.selected = model.selected.filter(item => !changeRecord.some(i => item.id === i.id));
    }
  };
  const removeUser = (id: ID) => {
    model.selected = model.selected.filter(item => item.id !== id);
  };

  const reset = () => {
    model.params = {
      pageNum: 1,
      pageSize: 20
    };
    loadTableList();
  };

  useEffect(() => {
    loadTableList();
  }, []);

  useEffect(() => {
    if (props.defaultSelected) model.selected = props.defaultSelected as User[];
    if (disableSelectedChecked && props.disabledSelected) model.selected.push(...props.disabledSelected as User[]);
    // 去重 用reduce写
    model.selected = model.selected.reduce((acc: User[], current) => {
      if (!acc.some(item => item.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);
  }, [props.defaultSelected, props.disabledSelected, disableSelectedChecked]);

  const onScrollToBottom = () => {
    if (model.params.pageNum < model.totalPage) {
      model.params.pageNum += 1;
      loadTableList();
    }
  };

  const _selected = useMemo(() => {
    if (!props.disabledSelected) return model.selected || [];
    return model.selected.filter(i => !props.disabledSelected?.some(d => d.id === i.id)) || [];
  }, [model.selected, props.disabledSelected]);

  useEffect(() => {
    props.onUserChange && props.onUserChange(_selected);
  }, [_selected]);
  return (
    <div className={style['user-selector']}>
      {/* 已经选中了的区域 */}
      <div className={style['selected-area']}>
        <div className={style['label']}>
          <span className={style['circle']}></span>
          <span>已选 <span className="main">{_selected.length}</span> 个</span>
        </div>
        <div className={style['selectedWrapper']}>
          {
            _selected.map(i => (
              <span key={i.id}>
                <span>{i.name}</span>
                <CloseOutlined onClick={() => removeUser(i.id)}/>
              </span>
            ))
          }
        </div>
      </div>
      <div className={style['search-panel']}>
        {
          querys.map(item => {
            if (item.type === 'input') return (
              <Input
                placeholder={placeholder}
                style={{ width: '250px' }}
                value={model.params[item.name]}
                onChange={e => model.params[item.name] = e.target.value}
                key={item.name}
              />
            );
          })
        }
        <Button type="primary" className="mr-10" onClick={search}>查询</Button>
        <Button onClick={reset}>重置</Button>
      </div>
      <Table
        list={model.list}
        loading={model.loading}
        columns={columns}
        scroll={{ y: '300px' }}
        selectedKeys={model.selected.map(item => item.id)}
        onSelectChange={onSelectChange}
        onScrollToBottom={onScrollToBottom}
        rowKey={rowKey}
        disabledCheckItems={props.disabledSelected}
      />
    </div>
  );
};

export default withIf(UserSelector);