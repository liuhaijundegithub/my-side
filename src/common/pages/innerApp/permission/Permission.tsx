import style from './style.module.less';
import { layer } from 'navyd';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Table, EncryptMobile } from '@/common/components';
import usePageState from '@/hooks/usePageState';
import { getRoleUsers, getRoleInfo, removeRoleUser, getSchoolAdmin, getMyroles, addRoleUser } from './service';
import { useEffect, useMemo } from 'react';
import { useReactive } from 'ahooks';
import SelectUser from './SelectUser';
import DeleteConfirm from '@/common/components/deleteConfirm/index';


const APP_ADMIN_KEY = 'ROLE_APP_ADMIN';
const APP_MANAGER_KEY = 'ROLE_APP_MANAGER';

const Permission: React.FC<GenerateAuthRouteProps> = props => {

  const { state, load } = usePageState(getRoleUsers, {
    columns: [
      { title: '教师', dataIndex: 'uname' },
      {
        title: '角色',
        render: (_, record) => {
          return model.roles.find(i => i.roleCode === record.roleCode)?.roleName || '-';
        }
      },
      {
        title: '手机号码',
        render: (_, record) => {
          return <EncryptMobile mobile={record.mobile} />;
        }
      },
      {
        title: '操作',
        // render: (_, record) => {
        //   return <span className="main pointer" onClick={() => removeUser(record)}>移除</span>;
        // }
        actions: [
          {
            label: '移除',
            disabled: record => record.mobile === '3',
            onClick: function (_, _this) {
              _this.loading = true;
            }
          }
        ]
      }
    ]
  });

  const model = useReactive({
    roles: [] as Role[],
    schoolAdmin: '',
    showModal: false,
    myRoles: [] as string[]
  });

  const loadSchoolAdmin = async () => {
    const { data } = await getSchoolAdmin();
    model.schoolAdmin = data.map((i) => i.name).join('、');
  };

  const loadMyRoles = async () => {
    const { data } = await getMyroles();
    model.myRoles = data;
  };

  const init = async () => {
    try {
      loadSchoolAdmin();
      loadMyRoles();
      const { data } = await getRoleInfo();
      model.roles = data.roles;
      load();
    } finally { 
      state.loading = false;
    }
  };

  const removeUser = (record: RoleUser) => {
    const dc = new DeleteConfirm({
      deleteFn: removeRoleUser,
      params: { userId: record.userId, roleCode: record.roleCode }
    });
    dc.on('success', () => {
      load();
    });
    // layer.confirm({
    //   title: '确认移除',
    //   content: <span>移除后，{record.uname}将无 <span className="bolder">{model.roles.find(i => i.roleCode === record.roleCode)?.roleName || '-'}</span> 权限！</span>,
    //   onConfirm: async () => {
    //     await removeRoleUser(record.userId, record.roleCode);
    //     load();
    //   }
    // })
  };

  const saveUser = async ({ userId, roleCode }: { userId: ID[], roleCode: string }) => {
    await addRoleUser(userId.toString(), roleCode);
    onCloseModal();
    load();
    layer.msg('添加成功');
  };

  const userList = useMemo(() => {
    return state.list.filter(i => i.roleCode !== 'ROLE_APP_ADMIN');
  }, [state.list]);

  const openModal = () => {
    model.showModal = true;
  };

  const onCloseModal = () => {
    model.showModal = false;
  };

  useEffect(() => {
    init();
  }, []);

  // 选择角色的options
  const options = useMemo(() => {
    if (model.myRoles.includes(APP_ADMIN_KEY)) {
      return model.roles.filter((v) => v.roleCode !== APP_ADMIN_KEY);
    } else if (model.myRoles.includes(APP_MANAGER_KEY)) {
      return model.roles.filter((v) => v.roleCode !== APP_ADMIN_KEY && v.roleCode !== APP_MANAGER_KEY);
    } else {
      return [];
    }
  }, [model.myRoles, model.roles]);

  return (
    <div className={style['auth-management']}>
      <div className={style['tip']}>
        <div>只有 <span className="bolder">校管理员 { model.schoolAdmin && '(' + model.schoolAdmin + ')' }</span> 才能设置和更换 <span className="bolder">应用管理员</span>；</div>
        <div>应用管理员：拥有“{props.appName}”应用的最高管理权限，只能设置一位老师，如需多个 <span className="bolder">应用管理员</span> 可添加 <span className="bolder">应用负责人</span>；</div>
        <div>应用负责人：除不能指定应用管理员和其他应用负责人外，权限同应用管理员；</div>
        {
          props.otherRoleDescriptions.map(i => (
            <div key={i}>{i}</div>
          ))
        }
      </div>

      <div className="flex-between mt-20">
        <div className="bolder font-16">应用管理员： {model.schoolAdmin}</div>
        <Button type="primary" onClick={openModal}>
          <PlusOutlined className="mr-10" />
          添加人员
        </Button>
      </div>

      <Table
        className="mt-20"
        columns={[
          { title: '教师', dataIndex: 'uname' },
          {
            title: '角色',
            render: (_, record) => {
              return model.roles.find(i => i.roleCode === record.roleCode)?.roleName || '-';
            }
          },
          {
            title: '手机号码',
            render: (_, record) => {
              return <EncryptMobile mobile={record.mobile} />;
            }
          },
          {
            title: '操作',
            // render: (_, record) => {
            //   return <span className="main pointer" onClick={() => removeUser(record)}>移除</span>;
            // }
            actions: [
              {
                label: '移除',
                disabled: record => record.mobile === '3',
                onClick: function (_, _this) {
                  _this.loading = true;
                }
              }
            ]
          }
        ]}
        list={[
          { mobile: '1', id: 1 },
          { mobile: '2', id: 1 },
          { mobile: '3', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 },
          { mobile: '11111', id: 1 }
        ]}
        loading={state.loading}
        autoHeight
        pagination={{ current: 1, pageSize: 10, total: 100 }}
      />
      <SelectUser
        open={model.showModal}
        onClose={onCloseModal}
        options={options}
        onConfirm={saveUser}
      />
    </div>
  );
};

export default Permission;