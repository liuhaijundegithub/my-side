import { Alert } from 'antd';
import type { AlertProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

export interface TipProps extends AlertProps{
  icon?: boolean;
  type?: AlertProps['type'];
  customIcon?: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

const Tip: React.FC<TipProps> = props => {
  const {
    icon = true,
    type = 'warning',
    ...rest
  } = props;
  return <Alert
    type={type}
    showIcon={icon}
    message={props.content}
    className={classNames('mana-tip', props.className)}
    icon={props.customIcon}
    { ...rest }
  />;
};

export default Tip;