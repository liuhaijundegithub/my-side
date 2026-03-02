import config from '@/config';
import service from '@common/ajax/index';


interface LoadPreviewDataParams {
  excelImportId: ID;
  pageNum: number,
  pageSize: number;
  statusList: string;
}
interface LoadPreviewDataRes {
  id: ID;
  excelImportId: ID;
  rowValue: string;
  status: string;
  msg: string;
}
/**
 * @description 步骤二 获取excel文件读取结果
 */
export const getPreviewData = (urlPrefix: string, params: LoadPreviewDataParams) =>
  service<BackendPaginationData<LoadPreviewDataRes[]>>(`${urlPrefix}/excel/result/${params.excelImportId}`, { data: params });

/**
 * @description 步骤二 点击数据入库
 */
export const serviceDataApply = (urlPrefix: string, excelImportId: ID) =>
  service<BackendData<boolean>>(`${urlPrefix}/excel/apply/student/${excelImportId}`, { type: 'post' });


interface ApplyProgress {
  excelImportId: ID;
  totalNum: number;
  unapplyNum: number;
  successNum: number;
  failureNum: number;
}
/**
 * @description 步骤二 点击数据入库之后查询入库进度
 */
export const serviceCheckApplyProgress = (urlPrefix: string, excelImportId: ID) =>
  service<BackendData<ApplyProgress>>(`${urlPrefix}/excel/apply/progress/${excelImportId}`);

/**
 * @description 后端获取Columns
 */
export const apiGetColumns = (urlPrefix: string, excelImportId: ID) =>
  service<BackendData<string[]>>(`${urlPrefix}/result/file/headinfo/${excelImportId}`);