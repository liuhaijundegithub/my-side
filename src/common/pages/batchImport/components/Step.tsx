import style from '../style.module.less';

interface StepProps {
  current: number;
}
const Step: React.FC<StepProps> = function (props) {
  const data = [
    {
      title: '步骤一',
      description: '上传文件'
    },
    {
      title: '步骤二',
      description: '预览上传数据'
    },
    {
      title: '步骤三',
      description: '导入完成结果'
    }
  ];
  return (
    <div className={style['step']}>
      {
        data.map((i, index) => (
          <div key={i.title} className={`${props.current === index + 1 ? style['active'] : ''}`}>
            <div>{index + 1}</div>
            <div>
              <div>{i.title}</div>
              <div className="grey">{i.description}</div>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default Step;