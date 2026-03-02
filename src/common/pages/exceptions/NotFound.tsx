import style from './index.module.less';

const PageNotFond = () => {
  return (
    <div
      className={style['not-fond']}
    >
      <div className="mr-10 bolder font-20">404</div>
      <div>This page could not be found.</div>
    </div>
  );
};

export default PageNotFond;