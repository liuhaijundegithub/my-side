import service from '@/common/ajax';
import config from '@/config';

// 历史记录
export interface GetImportHistoryRecordParmas {
  excelType: string;
  pageNum: number,
  pageSize: number;
}
export interface ImportHistory {
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
  createAt: number;
  modifyAt: number;
}

/**
 * @description 获取导入历史记录
 */
// TODO 这里的excelType字段并不一定是这个名子，需要与后端的接口文档一致， 这里也只是用云校的基础数据 导入学生 作为事例
export const getImportHistoryRecord = (urlPrefix: string) =>
  (data: GetImportHistoryRecordParmas) => service<BackendPaginationData<ImportHistory[]>>(`${urlPrefix}/excel/result/history/${data.excelType}`, { data });