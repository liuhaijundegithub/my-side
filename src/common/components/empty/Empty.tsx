import withIf from '@/common/hoc/withIf';
import { Empty as AntdEmpty } from 'antd';

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Empty = (props: EmptyProps) => {
  return (
    <AntdEmpty
      image={AntdEmpty.PRESENTED_IMAGE_SIMPLE}
      description={props.children}
    />
  );
};

export default withIf(Empty);
