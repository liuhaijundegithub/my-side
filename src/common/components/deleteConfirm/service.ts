import service from '@common/ajax/index';

// 删除验证 - 检查最后一次安全验证码校验状态
export const apiCheckDeleteConfirmStatus = () =>
  service<BackendData>('/basicdata/personal/common/pin/status', {type: 'get'});
