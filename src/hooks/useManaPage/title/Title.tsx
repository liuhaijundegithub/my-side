import classNames from 'classnames';
import style from './index.module.less';

export interface TitleProps {
  title: React.ReactNode;
  gap?: boolean;
  className?: string;
}

const Title: React.FC<TitleProps> = props => {
  return <div className={classNames(style['uni-title-wrapper'], 'font-18 bolder', props.className)}>
    { props.gap && <div className={style['gap']}></div> }
    <span>{ props.title }</span>
  </div>;
};

export default Title;
