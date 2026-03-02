import style from '../style.module.less';
import { Button } from 'antd';
import useRouter from '@/hooks/useRouter';

interface HeaderProps {
  current: number;
  onCurrentChange: (current: number) => void;
}

const Header: React.FC<HeaderProps> = props => {

  const router = useRouter();

  const back = () => {
    if (props.current < 4) router.back();
    // 在导入历史页面 也就是 步骤四
    else if (props.current === 4) props.onCurrentChange(1);
    // 在导入详情页面 也就是 步骤五
    else if (props.current === 5) props.onCurrentChange(4);
  };
  const toHistoryPage = () => {
    props.onCurrentChange(4);
  };
  return <div className={style['header']}>
    <div>
      {/* TODO header的样式 */}
    </div>
    <div>
      {
        props.current < 4 && <Button onClick={toHistoryPage}>历史导入记录</Button>
      }
      {/* TODO 返回的按钮不一定在这 */}
      <Button onClick={back}>返回</Button>
    </div>
  </div>;
};

export default Header;