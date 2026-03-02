import SelectFile from './steps/SelectFile';
import PreviewData from './steps/PreviewData';
import Finished from './steps/Finished';
import History from './steps/History';
import HistoryDetail from './steps/HistoryDetail';
import style from './style.module.less';
import Step from './components/Step';
import { useReactive } from 'ahooks';
import { BatchImportColumn, BatchImportProps } from './types';
import { useEffect, useMemo, useState } from 'react';
import useRouter from '@/hooks/useRouter';
import { BatchImportExcelReadRes } from './service/step1';
import Header from './components/Header';
import { UniExcelType } from './const';
import { ImportHistory } from './service/step4';

const BatchImport: React.FC<BatchImportProps> = props => {
  const {
    businessType,
    getTemplateExcel,
    columns,
    getColumns,
    dynamicColumns,
    urlPrefix,
    extraParams = {}
  } = props;

  // url上的参数
  const router = useRouter();
  const searchParams = router.getSearchParams();
  const params = router.getParams();
  const routerParams = useMemo(() => {
    return { ...searchParams, ...params };
  }, [params, searchParams]);

  const model = useReactive({
    current: 1,
    importId: -1 as ID,
    fileName: '',
    historyRecord: {} as ImportHistory
  });

  const onSelectFileFinished = (params: BatchImportExcelReadRes) => {
    model.importId = params.id;
    model.fileName = params.excelName;
    model.current++;
  };

  const [tableColumns, setTableColumns] = useState<BatchImportColumn[]>([]);

  // 预览数据时候 点击返回上一步
  const onPrevStep = () => {
    model.current--;
  };

  // 预览数据时候 点击上传数据
  const onPreviewDataFinished = () => {
    model.current++;
  };

  // 获取表格columns
  const loadColumns = async () => {
    if (dynamicColumns) {
      setTableColumns(columns || []);
      return;
    }
    if (getColumns) {
      const data = await getColumns(routerParams);
      setTableColumns(data);
    } else {
      setTableColumns(columns || []);
    }
  };
  useEffect(() => {
    loadColumns();
  }, []);

  // 控制显示历史纪录
  const setCurrent = (current: number) => {
    model.current = current;
  };


  // 进入到历史记录详情页面
  const toHistoryDetailPage = (record: ImportHistory) => {
    setCurrent(5);
    model.historyRecord = record;
  };

  const onColumnsChange = (data: BatchImportColumn[]) => {
    setTableColumns(data);
  };
  return (
    <div className={style['uni-batch-import']}>
      <Header current={model.current} onCurrentChange={setCurrent} />
      {
        model.current < 4 && <Step
          current={model.current}
        />
      }
      {
        (() => {
          if (model.current === 1) {
            return (
              <SelectFile
                onNextStep={onSelectFileFinished}
                businessType={businessType}
                onClickGetTemplate={getTemplateExcel}
                routerParams={routerParams}
                columns={tableColumns}
                config={props}
                excelType={props.excelType}
                urlPrefix={urlPrefix}
                extraParams={extraParams}
              />
            );
          }
          else if (model.current === 2) {
            return (
              <PreviewData
                importId={model.importId}
                excelName={model.fileName}
                onBack={onPrevStep}
                onFinished={onPreviewDataFinished}
                onColumnsChange={onColumnsChange}
                columns={tableColumns}
                config={props}
                dynamicColumns={dynamicColumns}
                urlPrefix={urlPrefix}
              />
            );
          }
          else if (model.current === 3) {
            return (
              <Finished
                config={props}
                importId={model.importId}
                excelName={model.fileName}
                columns={tableColumns}
                dynamicColumns={dynamicColumns}
                urlPrefix={urlPrefix}
              />
            );
          }
          // 历史记录页面
          else if (model.current === 4) {
            return (
              <History
                excelType={UniExcelType.SCHOOL_NEW_STUDENT}
                onToDetailPage={toHistoryDetailPage}
                extraParams={extraParams}
                urlPrefix={urlPrefix}
              />
            );
          }
          // 历史记录详情
          else if (model.current === 5) {
            return <HistoryDetail
              excelImportId={model.historyRecord.id}
              excelName={model.historyRecord.excelName}
              columns={tableColumns}
              dynamicColumns={dynamicColumns}
              tip={false}
              urlPrefix={urlPrefix}
            />;
          }
        })()
      }
    </div>
  );
};

export default BatchImport;