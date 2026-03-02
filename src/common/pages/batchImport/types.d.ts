import BusinessType from '@/common/alioss/businessType';
import { ColumnType } from 'antd/lib/table/interface';
import { UniExcelType } from './index';

interface BatchImportColumn extends ColumnType {
  required?: boolean;
}


export interface BatchImportProps {
  businessType: BusinessType;

  /**
   * @description 获取模板方法
   * @params 可能是动态获取模板，是否有参数不确定
   * @returns 不需要返回值，直接调用方法模板将 文件 下载下来即可
   */
  getTemplateExcel: (...args: any[]) => void | Promise<void>;

  /**
   * @description 非动态columns 优先级低于getColumns
   *
   */
  columns?: BatchImportColumn[];

  /**
   * @description 获取columns方法
   * @params 可能是动态获取columns，是否有参数不确定
   * @returns BatchImportColumn[];
   */
  getColumns?: (...args: any[]) => Promise<BatchImportColumn[]> | BatchImportColumn[];

  /**
   * @description 导入的业务场景类型
   * 字段名称可能有差异 importType、excelType、excelImportType
   * 需要和后端保持一致
   * !!! 在步骤一点击上传的时候使用，有可能是传参数，有可能集成到了后端接口地址（云校早期的导入）当中
   * !!! 在步骤四 查看历史导入记录接口作为参数使用，接口几乎是一致的
   */
  // TODO 字段名称可能不一样，需要确认 这里暂时用 excelType 作为示例 根据需要自行替换
  // TODO 且最好使用枚举类型，避免出现拼写错误
  excelType: UniExcelType;
  // 是不是动态获取的columns 如果是动态获取的columns，则不需要columns字段 则需要去调接口获取columns了
  dynamicColumns?: boolean;
  urlPrefix?: string; // 接口前缀
  title?: React.ReactNode;
  extraParams?: Record<string, any>;

}