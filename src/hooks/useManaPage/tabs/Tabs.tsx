import React from 'react';
import style from './index.module.less';
import classNames from 'classnames';

interface TabItem {
  label: React.ReactNode;
  key: any;
  permission?: string;
}
export interface TabProps {
  items: TabItem[];
  onChange?: (key: string) => void;
  activeKey?: string;
  className?: string;
}
const Tab: React.FC<TabProps> = ({ items, onChange, activeKey, className }) => {
  const tabChange = (key: any) => {
    onChange && onChange(key);
  };
  return (
    <div className={classNames(style.tab, className)}>
      {
        items.map(i => {
          return (
            <span
              key={i.key}
              className={i.key === activeKey ? style.active : ''}
              onClick={() => tabChange(i.key)}
            >
              {i.label}
            </span>
          );
        })
      }
    </div>
  );
};

export default Tab;
