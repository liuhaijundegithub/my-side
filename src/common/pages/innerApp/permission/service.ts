import service from '@/common/ajax';
import config from '@/config';

export const getRoleInfo = () =>
  service<BackendData<{ explain: string; roles: Role[] }>>(`${config.urlPrefix}/teacher/mana/role/info`);

// 角色管理-应用角色成员列表
export const getRoleUsers = (params: { roleCode?: string }) =>
  service<BackendData<RoleUser[]>>(`${config.urlPrefix}/teacher/mana/role/users`, { data: params });

// 通用-获取当前用户的角色列表，一般教师才需要调用d
export const getMyroles = (needTeacherRole?: boolean) =>
  service<BackendData<string[]>>(`${config.urlPrefix}/common/myroles`, { data: { needTeacherRole } });

// 角色管理-设置人员（应用管理员只有一个,且无法设置）
export const addRoleUser = (userId: string, roleCode: string) =>
  service<BackendData<boolean>>(`${config.urlPrefix}/teacher/mana/role/add`, {
    data: {
      userId,
      roleCode
    },
    type: 'put-qs'
  });

// 角色管理-移除人员（应用管理员只有一个,且无法移除）
export const removeRoleUser = (data: { userId: number; roleCode: string }) =>
  service<BackendData<boolean>>(`${config.urlPrefix}/teacher/mana/role/remove`, {
    data,
    type: 'put-qs'
  });

/** 获取校管 */
export const getSchoolAdmin = () =>
  service<BackendData<SchoolAdmin[]>>(`${config.urlPrefix}/common/schooladmin`);

// 获取当前学校应用版本
// readonly getAppVersion = () =>
//   service.get<{ code: string; name: string }[]>(`${config.urlPrefix}/common/myappmodule`, unMessageError({}));

// /** 获取图标、应用名称等基础信息 */
// private readonly getAppInfo = () =>
//   service.get<{
//     applicationVersion: string;
//     icon: string;
//     name: string;
//     schoolApplicationId: ID;
//   }>(`${config.urlPrefix}/common/schoolappinfo`);

// /** 获取当前用户可见模块 */
// private readonly getModule = () =>
//   service.get<{
//     code: string;
//     name: string;
//   }[]>(`${config.urlPrefix}/common/myappmodule`, unMessageError({}));

// // 通用 - 获取当前快捷方式信息
// private readonly getInternalHyperlinkInfo = (shareCode: string) =>
//   service.get<{
//     name: string;
//     applicationVersion: string;
//     icon: string;
//     webUrl: string;
//     h5Url: string;
//   }>(`${config.urlPrefix}/common/internalhyperlinkinfo`, { shareCode });