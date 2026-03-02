import { Tabs, Button } from 'antd';
import style from '../style.module.less';
import { Table, Tip } from '@/common/components';
import { useEffect, useMemo, useState } from 'react';
import { useReactive } from 'ahooks';
import { apiGetColumns, getPreviewData } from '../service/step2';
import useRouter from '@/hooks/useRouter';
import { BatchImportColumn } from '../types';
import { serviceDownloadImportDetail } from '../service/step3';
import { ExportOutlined } from '@ant-design/icons';

export interface ResultProps {
  excelImportId: ID;
  excelName: string;
  tip: boolean;
  columns: BatchImportColumn[];
  dynamicColumns?: boolean;
  urlPrefix?: string;
}
const Result: React.FC<ResultProps> = function (props) {

  const {
    urlPrefix = ''
  } = props;
  const [tab, setTab] = useState('fail');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const model = useReactive({
    dynamicColumns: [] as BatchImportColumn[],
    success: {
      pagiation: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      list: [] as any
    },
    fail: {
      pagiation: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      list: [] as any
    }
  });

  const state = useMemo(() => {
    if (tab === 'success') return model.success;
    else return model.fail;
  }, [tab]);


  const tabChange = (value: string) => {
    setTab(value);
  };

  useEffect(() => {
    if (props.dynamicColumns) {
      apiGetColumns(urlPrefix, props.excelImportId)
        .then(({ data }) => {
          model.dynamicColumns = data.map(i => ({
            title: i,
            dataIndex: i
          }));
        });
    }
  }, [props.dynamicColumns]);

  const columns = useMemo(() => {
    const c = props.dynamicColumns ? model.dynamicColumns : props.columns;
    if (tab === 'success') {
      return c;
    } else {
      return [...c, { title: '失败原因', dataIndex: 'msg', key: 'msg' }];
    }
  }, [props.columns, tab, props.dynamicColumns]);

  const loadSuccessList = async () => {
    setLoading(true);
    getPreviewData(urlPrefix, {
      excelImportId: props.excelImportId,
      pageNum: model.success.pagiation.current,
      pageSize: model.success.pagiation.pageSize,
      statusList: 'SUCCESS'
    })
      .then(res => {
        model.success.list = res.data.dataList.map(i => {
          return JSON.parse(i.rowValue);
        });
        model.success.pagiation.total = res.data.totalCount;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadFailList = async () => {
    setLoading(true);
    getPreviewData(urlPrefix, {
      excelImportId: props.excelImportId,
      pageNum: model.fail.pagiation.current,
      pageSize: model.fail.pagiation.pageSize,
      statusList: 'FAILURE,UNAPPLY,FAILURE_PRECHECK'
    })
      .then(res => {
        model.fail.list = res.data.dataList.map(i => {
          return {
            ...JSON.parse(i.rowValue),
            msg: i.msg
          };
        });
        model.fail.pagiation.total = res.data.totalCount;
      })
      .finally(() => {
        setLoading(false);
      });

  };

  const clickFinish = () => {
    router.back();
  };

  const onPageChange = (current: number, pageSize: number) => {
    Object.assign(tab === 'success' ? model.success.pagiation : model.fail.pagiation, { current, pageSize });
    if (tab === 'success') loadSuccessList();
    else loadFailList();
  };

  const init = async () => {
    await loadFailList();
    await loadSuccessList();
  };

  useEffect(() => {
    init();
  }, []);

  // 导出导入详情
  const downloadExcel = async function () {
    const blob = await serviceDownloadImportDetail({
      excelImportId: props.excelImportId,
      statusList: tab === 'success' ? 'SUCCESS' : 'FAILURE,UNAPPLY,FAILURE_PRECHECK'
    });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const arr = props.excelName.split('.');
    arr[arr.length - 2] = arr[arr.length - 2] + (tab === 'success' ? '(成功)' : '(失败)');
    a.download = arr.join('.');
    a.href = objectUrl;
    a.click();
  };

  return (
    <div className={style['result']}>
      {
        props.tip && <Tip
          content={
            <div className="flex align-center w-full">
              <div>
              数据成功上传<span className="main ml-3 mr-3">{model.success.pagiation.total}</span>条，
              失败<span className="red bolder ml-3 mr-3">{model.fail.pagiation.total}</span>条，详情见下表。
              </div>
              <Button type="primary" size="small" style={{ marginLeft: 'auto' }} onClick={clickFinish}>完成</Button>
            </div>
          }
        />
      }
      <Tabs
        activeKey={tab}
        type="card"
        className="mt-20"
        onChange={tabChange}
        items={[
          { label: `成功(${model.success.pagiation.total})`, key: 'success' },
          { label: `失败(${model.fail.pagiation.total})`, key: 'fail' }
        ]}
        tabBarExtraContent={
          <div className={style['export']}>
            <Button
              onClick={downloadExcel}
              className="mb-10"
            >
              <ExportOutlined className="mr-5" />
              导出
            </Button>
          </div>
        }
      />
      {/* 表格 */}
      <Table
        columns={columns}
        list={state.list}
        className="mt-20"
        showIndex
        pagination={state.pagiation}
        onPagechange={onPageChange}
        loading={loading}
        rowKey={'index'}
        autoHeight
      />
    </div>
  );
};


export default Result;