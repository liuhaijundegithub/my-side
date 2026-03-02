import { Table, EncryptMobile } from '@/common/components';
import { Divider } from 'antd';
import style from '../style.module.less';
import moment from 'dayjs';
import usePageState from '@/hooks/usePageState';
import { GetImportHistoryRecordParmas, ImportHistory, getImportHistoryRecord } from '../service/step4';
import { UniExcelType } from '../const';
import { useEffect } from 'react';
import { getSignedUrl } from '@/common/alioss';
import { layer } from 'navyd';


interface HistoryProps {
  excelType: UniExcelType;
  onToDetailPage: (record: ImportHistory) => void;
  extraParams: Record<string, any>;
  urlPrefix?: string;
}
const History: React.FC<HistoryProps> = function (props) {

  const {
    urlPrefix = ''
  } = props;

  const { pagination, load, state } = usePageState<GetImportHistoryRecordParmas, ImportHistory>(getImportHistoryRecord(urlPrefix), {
    searchParams: {
      pageNum: 1,
      pageSize: 20,
      excelType: props.excelType
    },
    columns: [
      { title: '文件名', dataIndex: 'excelName' },
      {
        title: '上传时间',
        render: (_, record) => {
          return moment(record.createAt).format('YYYY-MM-DD HH:mm');
        }
      },
      {
        title: '上传人',
        render: (_, record) => {
          return <>
            <div>{record.opUname}</div>
            <EncryptMobile mobile={record.opMobile} />
          </>;
        }
      },
      { title: '成功', dataIndex: 'successNum' },
      {
        title: '失败',
        render: (_, record) => {
          return <span className="red">{ record.failedNum }</span>;
        }
      },
      {
        title: '入库状态',
        render: (_, record) => {
          return record.status === 'APPLIED' ? '已入库' : '未入库';
        }
      },
      {
        title: '入库时间',
        render: (_, record) => {
          return moment(record.createAt).format('YYYY-MM-DD HH:mm');
        }
      },
      {
        title: '操作',
        width: 170,
        render: (_, record) => {
          return <>
            <span className="main pointer" onClick={() => toImportDetailPage(record)}>详情</span>
            <Divider type="vertical" />
            <span className="main pointer" onClick={() => downloadOriginalFile(record)}>原始文件下载</span>
          </>;
        }
      }
    ]
  });

  const toImportDetailPage = (record: ImportHistory) => {
    props.onToDetailPage(record);
  };

  const onPageChange = (current: number, pageSize: number) => {
    Object.assign(pagination, { current, pageSize });
    load();
  };

  const downloadOriginalFile = async (record: ImportHistory) => {
    const toast = () => {
      layer.alert({
        title: '提示',
        content: '原文件已被删除，无法下载'
      });
    };
    if (!record.excelUrl) {
      toast();
      return false;
    }
    try {
      const url = await getSignedUrl({ src: record.excelUrl, filename: record.excelName });
      window.open(url, '_blank');
    } catch {
      toast();
    }
  };

  useEffect(() => {
    load();
  }, []);
  return (
    <div className={style['history']}>
      <Table
        columns={state.columns}
        list={state.list}
        pagination={pagination}
        scroll={{ y: 'calc(100vh - 280px)' }}
        showIndex
        onPagechange={onPageChange}
        loading={state.loading}
        autoHeight
      >
      </Table>
    </div>
  );
};

export default History;