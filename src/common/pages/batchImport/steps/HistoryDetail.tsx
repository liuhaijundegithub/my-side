import Result, { ResultProps } from '../components/Result';
import style from '../style.module.less';

const HistoryDetail: React.FC<ResultProps> = function (props) {
  return <div className={style['history-detail']}>
    <div className="center bolder font-20 mb-70 pt-20">{ props.excelName }</div>
    <Result
      { ...props }
    />
  </div>;
};

export default HistoryDetail;