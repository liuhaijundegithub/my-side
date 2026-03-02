import { IconFont } from '@/common/components';
import { Dropdown, Button } from 'antd';
import { ButtonType, ButtonProps } from 'antd/es/button';
import React, { useMemo } from 'react';
import usePermission from '@/hooks/usePermission';
import { useReactive } from 'ahooks';

export interface PageActions {
  icon?: string;
  label: string;
  type?: ButtonType;
  disabled?: boolean;
  onClick?: (props: ActionModel) => void | Promise<void>;
  permission?: string;
  children?: {
    label: string;
    disabled?: boolean;
    permission?: string;
    onClick?: () => void | Promise<void>;
  }[];
}

interface ActionModel {
  loading: boolean;
}
interface UniButtonProps {
  onClick?: (prop: ActionModel) => void;
}
const UniButton: React.FC<UniButtonProps & Omit<ButtonProps, 'onClick'>> = props => {
  const model = useReactive<ActionModel>({
    loading: false
  });
  return <Button
    {...props}
    loading={model.loading}
    onClick={() => {
      props.onClick && props.onClick(model);
    }}
  />;
};

const Actions = (props: { config: (PageActions | React.FC)[] }) => {
  const { config = [] } = props;
  const hasPermission = usePermission();
  const items = useMemo(() => {
    // ! 没设置permssion认为有权限
    // ! 设置了permission之后，判断是否有权限
    // ! 如果最外层设置了权限并且有权限 直接通过 反之直接过滤掉 不会判断children
    // ! 如果最外层没有设置权限，判断children的权限
    // ! 如果children发现都没有权限，连同外层一起过滤掉
    // ! 如果children发现 >=1 个有权限，有权限的children连同外层一起保留

    return config.reduce((a, crr) => {
      const c = crr as PageActions;
      if (!c.permission) {
        if (c.children && c.children.length) {
          const children = c.children.filter(item => {
            if (!item.permission) return true;
            else return hasPermission(item.permission);
          });
          if (children.length > 0) {
            c.children = children;
            return [...a, c];
          } else return a;
        } return [...a, c];
      } else if (hasPermission(c.permission)) return [...a, c];
      else return a;
    }, [] as typeof config);
  }, [config]);
  return <div className="flex align-center">
    {
      items.map(item => {
        if (typeof item === 'function') {
          const C = item as React.FC;
          return <C key={React.useId()} />;
        }
        const i = item as PageActions;
        if (i.children && i.children.length) return <Dropdown
          key={i.label}
          menu={{
            items: i.children.map(s => ({
              key: s.label,
              label: <div onClick={() => !s.disabled && s.onClick && s.onClick()}>{s.label}</div>,
              disabled: s.disabled
            }))
          }}
        >
          <UniButton type={i.type as ButtonType} className="ml-10" disabled={i.disabled}>
            { i.icon && <IconFont type={i.icon} /> }
            {i.label}
          </UniButton>
        </Dropdown>;
        else return <UniButton key={i.label} type={i.type as ButtonType} className="ml-10" onClick={(model) => i.onClick && i.onClick(model)} disabled={i.disabled}>
          { i.icon && <IconFont type={i.icon} /> }
          {i.label}
        </UniButton>;
      })
    }
  </div>;
};

export default Actions;
