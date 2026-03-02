import style from '../style.module.less';
import { Button, Form, Radio } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import useRouter from '@/hooks/useRouter';
import { CloudDownloadOutlined } from '@ant-design/icons';
import BusinessType from '@/common/alioss/businessType';
import useUploadFile from '@/hooks/useUploadFile';
import { BatchImportProps } from '../types';
import { batchImportExcelRead, BatchImportExcelReadRes, batchImportExcelReadProgress } from '../service/step1';
import React from 'react';
import { UniExcelType } from '../const';
import { useReactive } from 'ahooks';

interface SelectFileProps {
  onNextStep: (params: BatchImportExcelReadRes) => void;
  businessType: BusinessType;
  onClickGetTemplate: BatchImportProps['getTemplateExcel'];
  columns: BatchImportProps['columns'];
  routerParams: Record<string, string | undefined>;
  config: BatchImportProps;
  excelType: UniExcelType;
  urlPrefix?: string;
  extraParams: Record<string, any>;
}

const SelectFile: React.FC<SelectFileProps> = ({
  onNextStep,
  businessType,
  onClickGetTemplate,
  routerParams,
  columns = [],
  excelType,
  urlPrefix = '',
  extraParams = {}
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { UploadFile, list } = useUploadFile({
    businessType,
    max: 1,
    accepts: ['xlsx', 'xls']
  });

  const model = useReactive({
    interval: 1 as Interval,
    uploadNum: 0,
    loading: false,
    deleteFileAfterRead: false
  });

  const getTemplate = () => {
    onClickGetTemplate && onClickGetTemplate(routerParams);
  };
  const onCancel = () => {
    router.back();
  };
  const nextStep = async () => {
    try {
      setLoading(true);
      model.loading = true;
      const { size, name, src } = list[0];
      const { data } = await batchImportExcelRead(urlPrefix, {
        excelUrl: src,
        excelSizeB: size!,
        excelName: name,
        excelType,
        deleteFileAfterRead: model.deleteFileAfterRead,
        ...extraParams
      });
      // model.interval = setInterval(() => {
      //   // 查询进度
      //   batchImportExcelReadProgress(urlPrefix, data.id)
      //     .then(res => {
      //       const { status, uploadNum } = res.data;
      //       model.uploadNum = uploadNum;
      //       if (status === 'UNAPPLY') {
      //         clearInterval(model.interval);
      //         setTimeout(() => {
      //           model.loading = false;
      //           onNextStep(data);
      //         }, 200);
      //       }
      //     })
      //     .catch(() => {
      //       clearInterval(model.interval);
      //       model.loading = false;
      //     });
      // }, 2000);
      onNextStep(data);
    } catch {
      clearInterval(model.interval);
      model.loading = false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(model.interval);
    };
  }, []);


  const btnDisabled = useMemo(() => {
    return list.filter(i => i.status === 'done').length === 0;
  }, [list]);

  return <div className={style['select-file']}>
    <div className="">
      <div>1.下载导入模板</div>
      <div>根据提示信息完善表格内容，<span className="red">模板中包含填写须知，请仔细阅读</span></div>
      {/* 按钮 */}
      <Button
        className="mt-10 flex-center"
        onClick={getTemplate}
      >
        <CloudDownloadOutlined />
        下载模板
      </Button>
    </div>
    <div className="mt-20">
      <div>2.选择上传文件</div>
      <div className="mt-10 mb-10">
        <UploadFile />
      </div>
      <div>
        温馨提示：
        <ul>
          <li>请勿修改表格结构。</li>
          <li>上传文件格式支持xls、xlsx格式文件。</li>
          {
            columns.length > 0 && <li>字段：{ columns.map(i => <React.Fragment key={i.title as string}><span className={i.required ? 'red': ''}>{i.title as string}</span><>，</></React.Fragment>) }红色为必填字段。</li>
          }
          <li>系统只扫描sheet1表格中的数据，请勿将数据存储在sheet2、sheet3等表格。</li>
          <li><span className="red">上传文件请勿包含空行。</span></li>
        </ul>
      </div>
    </div>
    <div className="mt-20">
      <Form.Item required label="3.文件清理规则" style={{ margin: '0' }} />
      <Radio.Group value={model.deleteFileAfterRead} onChange={e => model.deleteFileAfterRead = e.target.value}>
        <div className="mt-5">
          <Radio value={true}>入库成功后删除上传文件</Radio>
        </div >
        <div className="mt-5">
          <Radio value={false}>入库成功仍保留上传文件</Radio>
        </div>
      </Radio.Group>
    </div>
    <div className="mt-20 flex-center">
      <Button className="mr-20" onClick={onCancel}>取消</Button>
      <Button
        type="primary"
        disabled={btnDisabled}
        loading={loading}
        onClick={nextStep}
      >
        数据校验
      </Button>
    </div>
  </div>;
};

export default SelectFile;