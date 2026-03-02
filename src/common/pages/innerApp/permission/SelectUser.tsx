import { layer, Modal } from 'navyd';
import { UserSelector } from '@/common/components';
import { Form, Select } from 'antd';
import { useMemo } from 'react';
import { useReactive } from 'ahooks';
import { Teacher } from '@/common/components/userSelector/service';


interface SelectUserProps {
  open: boolean;
  onClose?: () => void;
  options: Role[];
  onConfirm: ({ roleCode, userId }: { roleCode: string, userId: ID[]}) => void;
}
const SelectUser: React.FC<SelectUserProps> = props => {

  const options = useMemo(() => {
    return props.options.map(i => ({
      label: i.roleName,
      value: i.roleCode
    }));
  }, [props.options]);

  const model = useReactive({
    roleCode: undefined as string | undefined,
    userId: [] as ID[]
  });

  const onUserChange = (users: Teacher[]) => {
    model.userId = users.map(i => i.id);
  };
  const onConfirm = () => {
    if (!model.roleCode) {
      layer.error('请选择人员角色');
      return false;
    }
    if (!model.userId.length) {
      layer.error('请选择人员');
      return false;
    }
    props.onConfirm({
      roleCode: model.roleCode,
      userId: model.userId
    });
    closeModal();
  };

  const closeModal = () => {
    model.roleCode = undefined;
    props.onClose && props.onClose();
  };
  return (
    <Modal
      open={props.open}
      onCancel={closeModal}
      width={800}
      title="添加人员"
      onConfirm={onConfirm}
    >
      {/* 选择人员角色 */}
      <Form>
        <Form.Item label="选择人员角色" required>
          <Select
            style={{ width: '260px' }}
            placeholder="请选择人员角色"
            options={options}
            allowClear
            value={model.roleCode}
            onChange={e => model.roleCode = e}
          />
        </Form.Item>
      </Form>

      <div style={{ height: '610px', maxHeight: '70vh', overflow: 'auto' }}>
        {
          props.open && <UserSelector
            querys={['search', 'grade', 'course', 'position']}
            onUserChange={onUserChange}
          />
        }
      </div>
    </Modal>
  );
};

export default SelectUser;