import { useReactive } from 'ahooks';
import { getPreviewData, serviceDataApply, serviceCheckApplyProgress, apiGetColumns } from '../service/step2';
import { Table, Tip } from '@/common/components';
import { useEffect } from 'react';
import { Button, Spin } from 'antd';
import { BatchImportColumn, BatchImportProps } from '../types';
import { layer } from 'navyd';

interface PreviewDataProps {
  importId: ID;
  excelName: string;
  onBack: () => void;
  onFinished: () => void;
  onColumnsChange: (columns: BatchImportColumn[]) => void;
  columns: BatchImportColumn[];
  // 全局配置
  config: BatchImportProps;
  dynamicColumns?: boolean;
  urlPrefix?: string;
}

const PreviewData: React.FC<PreviewDataProps> = function (props) {

  const {
    urlPrefix = ''
  } = props;

  const model = useReactive({
    current: 1,
    pageSize: 20,
    data: [] as any,
    loading: false,
    total: 0,
    interval: 1,
    totol: 0,
    checked: 0,
    applyLoading: false
  });

  const loadData = function () {
    model.loading = true;
    getPreviewData(urlPrefix, {
      excelImportId: props.importId,
      pageNum: model.current,
      pageSize: model.pageSize,
      statusList: 'UNAPPLY,FAILURE_PRECHECK'
    })
      .then(res => {
        model.data = res.data.dataList.map(i => {
          return JSON.parse(i.rowValue);
        });
        model.total = res.data.totalCount;
      })
      .finally(() => {
        model.loading = false;
      });
  };


  const onPageChange = (current: number, pageSize: number) => {
    Object.assign(model, { current, pageSize });
    loadData();
  };

  useEffect(() => {
    loadData();
    return function () {
      clearInterval(model.interval);
      model.interval = 1;
    };
  }, [props.importId]);

  useEffect(() => {
    if (props.dynamicColumns && props.importId) {
      apiGetColumns(urlPrefix, props.importId)
        .then(({ data }) => {
          const columns = data.map(i => ({
            title: i,
            dataIndex: i
          }));
          props.onColumnsChange(columns);
        });
    }
  }, [props.dynamicColumns, props.importId]);

  const onDataApply = async () => {
    try {
      model.applyLoading = true;
      const { data } = await serviceDataApply(urlPrefix, props.importId);
      if (data) {
        model.interval = setInterval(() => {
          // 查询进度
          serviceCheckApplyProgress(urlPrefix, props.importId)
            .then(res => {
              const { totalNum, unapplyNum } = res.data;

              model.total = totalNum;
              model.checked = totalNum - unapplyNum;

              if (unapplyNum === 0) {
                setTimeout(() => {
                  clearInterval(model.interval);
                  model.interval = 1;
                  model.applyLoading = false;
                  props.onFinished();
                }, 1000);
              }
            })
            .catch(() => {
              clearInterval(model.interval);
              model.applyLoading = false;
            });
        }, 2000);
      }
    } catch (error) {
      console.error('数据入库失败:', error);
      layer.error('数据入库失败，请稍后重试！');
      model.applyLoading = false;
      clearInterval(model.interval);
    }
  };

  useEffect(() => {
    return () => clearInterval(model.interval);
  }, []);

  return (
    <div>
      <Tip
        className="mb-20 flex"
        content={
          <div className="flex-between">
            <div>
              上传文件"{props.excelName}"中扫描到 <span className="red bolder">{model.total}</span> 条数据记录，
              明细见下表，确认无误后，点击<span className="main">【数据入库】</span>
              完成上传。
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className="mr-20 grey pointer" onClick={props.onBack}>返回重新上传文件</span>
              <Button type="primary" size="small" onClick={onDataApply}>数据入库</Button>
            </div>
          </div>
        }
      />
      <Table
        columns={props.columns}
        list={model.data}
        loading={model.loading}
        onPagechange={onPageChange}
        pagination={{
          current: model.current,
          pageSize: model.pageSize,
          total: model.total
        }}
        showIndex
        rowKey={'index'}
        autoHeight
      />
      {/* 全屏loading */}
      <Spin spinning={model.applyLoading} fullscreen tip={`数据入库中${model.checked}/${model.total}...`}>
      </Spin>
    </div>
  );
};

export default PreviewData;