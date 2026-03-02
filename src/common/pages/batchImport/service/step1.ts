import service from '@common/ajax/index';
import { UniExcelType } from '../const';

export interface BatchImportExcelReadParams {
  excelName: string;
  excelUrl: string;
  excelSizeB: number;
  // TODO 不一定是 【excelType】可能命名为别的，需要与后端的接口文档确认
  excelType: UniExcelType;
  deleteFileAfterRead?: boolean;
}


export interface BatchImportExcelReadRes {
  id: ID;
  excelType: string;
  excelTypePrimaryKey: number;
  excelName: string;
  excelUrl: string;
  excelSizeB: number;
  opUserId: ID;
  opUname: string;
  opMobile: string;
  status: string;
  schoolId: ID;
  successNum: number;
  failedNum: number;
  createAt: string;
}

/**
 * @description 步骤一 上传到后端的excel文件读取
 */
// TODO 这里需要使用 【importType】作为接口的参数， 这里使用了云校基础数据学生导入作为例子，不需要这个参数，而是直接接口地址有了student
export const batchImportExcelRead = (urlPrefix: string, data: BatchImportExcelReadParams) =>
  service<BackendData<BatchImportExcelReadRes>>(`${urlPrefix}/excel/read/student`, { data, type: 'post-qs' });

/**
 * @description 步骤一 上传到后端的excel文件读取 进度查询
 */
export const batchImportExcelReadProgress = (urlPrefix: string, excelImportId: ID) =>
  service<BackendData<{status: string; uploadNum: number}>>(`${urlPrefix}/excel/read/progress/${excelImportId}`);