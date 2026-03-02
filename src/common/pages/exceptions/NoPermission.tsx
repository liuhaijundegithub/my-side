import style from './index.module.less';

const NoPermission = () => {
  return (
    <div
      className={style['not-fond']}
    >
      <div className="mr-10 bolder font-20">401</div>
      <div>you don&apos;t have the permission.</div>
    </div>
  );
};

export default NoPermission;