import service from '@/common/ajax/index';
import config from '@/config';


interface DownloadImportDetailParams {
  excelImportId: ID;
  statusList?: string;
}

export const serviceDownloadImportDetail = (params: DownloadImportDetailParams) =>
  service<Blob>(`${config.urlPrefix}/teacher/mana/excel/result/${params.excelImportId}/export`, { data: params, responseType: 'blob' });