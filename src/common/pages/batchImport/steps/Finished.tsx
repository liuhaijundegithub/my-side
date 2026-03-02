import Result from '../components/Result';
import { BatchImportColumn, BatchImportProps } from '../types';


interface FinishedProps {
  config: BatchImportProps;
  columns: BatchImportColumn[];
  importId: ID;
  excelName: string;
  dynamicColumns?: boolean;
  urlPrefix?: string;
}
const Finished: React.FC<FinishedProps> = props => {
  return <Result
    columns={props.columns}
    tip
    excelImportId={props.importId}
    excelName={props.excelName}
    dynamicColumns={props.dynamicColumns}
    urlPrefix={props.urlPrefix}
  />;
};

export default Finished;