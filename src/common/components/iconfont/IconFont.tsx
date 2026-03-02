import { createFromIconfontCN } from '@ant-design/icons';
import config from '@/config';
import withIf from '@/common/hoc/withIf';

const IconFont = createFromIconfontCN({
  scriptUrl: config.iconfontUrl
});

export default withIf(IconFont);
