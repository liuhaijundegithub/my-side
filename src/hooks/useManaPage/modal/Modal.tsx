import { Spin } from 'antd';
import React from 'react';
import { Modal, ModalProps } from 'navyd';

interface UniModalProps extends ModalProps {
  loading?: boolean;
  mode: DrawerMode;
  onSave: () => void;
  onModeChange?: (mode: DrawerMode) => void;
  onCancelEdit: () => void;
  modifyPermission?: string;
}
const UniDrawer: React.FC<UniModalProps> = props => {
  const { title, open, loading, ...rest } = props;

  return <Modal
    { ...rest }
    title={title}
    open={Boolean(open)}
    className="usemana-drawer"
    width={rest.width || 560}
    onConfirm={props.onSave}
    onCancel={props.onCancelEdit}
    footer={rest.mode === 'preview' ? null : undefined}
  >
    <div className="usemana-drawer-content">
      <div className="usemana-drawer-content-container">
        <Spin spinning={loading}>
          { props.children }
        </Spin>
      </div>
    </div>
  </Modal>;
};

export default UniDrawer;
