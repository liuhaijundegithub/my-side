import { CommonHTMLAttributes } from 'navyd/dist/types/global';
import style from './style.module.less';
import classNames from 'classnames';

const Card: React.FC<CommonHTMLAttributes> = props => {
  const { children, className, ...rest } = props;
  return <div
    className={classNames(style['card'], className)}
    { ...rest }
  >
    { children }
  </div>;
};

export default Card;
