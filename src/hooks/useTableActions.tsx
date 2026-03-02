/* eslint-disable no-lonely-if */
import { Divider, Dropdown, Space } from 'antd';
import usePermission from './usePermission';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { CommonHTMLAttributes } from 'navyd/dist/types/global';
import { useReactive } from 'ahooks';


interface ActionModel {
  loading: boolean;
}

export interface UseTableActionsConfig<T> {
  label: string;
  onClick?: (record: T, model: ActionModel) => Promise<any> | any;
  hidden?: (record: T) => boolean;
  disabled?: (record: T) => boolean;
  children?: Omit<UseTableActionsConfig<T>, 'children'>[];
  permission?: string | string[];
  type?: 'some' | 'every';

}

interface ActionsProps<T> {
  config: UseTableActionsConfig<T>[];
  record: T;
}

interface ActionProps extends Omit<CommonHTMLAttributes, 'onClick'> {
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: (props: ActionModel) => Promise<any> | any;
}

const commonButtonStyle = {
  padding: '0'
};

const Action: React.FC<ActionProps> = props => {
  const { disabled, children, onClick, ...rest } = props;
  const model = useReactive<ActionModel>({
    loading: false
  });

  const handleClick = () => {
    if (model.loading || disabled) return;
    onClick && onClick(model);
  };

  return <span
    className={classNames('pointer', 'main', model.loading && 'loading', disabled && 'disabled')}
    onClick={handleClick}
    { ...rest }
  >
    <span className="label">{ children }</span>
    {
      model.loading && <LoadingOutlined spin />
    }
  </span>;
};

function Actions<T> (props: ActionsProps<T>) {
  const hasPermission = usePermission();
  const { config, record } = props;
  // 过滤一下权限
  const c = config.reduce((a, c) => {
    const { permission, type = 'some', children, hidden = () => false } = c;
    if (children && children.length > 0) {
      const filtered = children.filter((c) => hasPermission(c.permission!, c.type!) && !hidden(record));
      if (filtered.length > 0) {
        return [...a, { ...c, children: filtered}];
      } else {
        return a;
      }
    } else if (!permission && !hidden(record)) return [...a, c];
    else return hasPermission(permission, type) && !hidden(record) ? [...a, c] : a;
  }, [] as typeof config);

  return <Space split={<Divider type="vertical" />} size={0}>
    {
      c.map(i => {
        if (i.children && i.children.length > 0) return <Dropdown
          trigger={['click']}
          key={i.label}
          menu={{
            items: i.children.map(item => ({
              label: <Action
                onClick={(model) => item.onClick && item.onClick(record, model)}
                style={commonButtonStyle}
                disabled={item.disabled ? item.disabled(record) : false}
              >
                {item.label}
              </Action>,
              key: item.label
            }))
          }}
        >
          <Space size={2}>
            <Action>{i.label}</Action>
            <DownOutlined className="font-12 main" />
          </Space>
        </Dropdown>;
        else return <Action
          key={i.label}
          disabled={i.disabled ? i.disabled(record) : false}
          onClick={model => i.onClick && i.onClick(record, model)}
          style={commonButtonStyle}
        >
          {i.label}
        </Action>;
      })
    }
  </Space>;
}

function useTableActions<T> (config: UseTableActionsConfig<T>[], record: T) {
  return () => <Actions
    config={config}
    record={record}
  />;
}

export default useTableActions;