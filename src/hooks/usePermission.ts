import { useState } from 'react';

const usePermission = () => {
  // TODO 获取用户的权限项
  // ? 这里 useState例子是为了测试是否正确使用了hooks方法，实际项目中需要替换成获取用户权限的代码 大概率也是用hooks方法获取
  const [permissions] = useState<string[]>([]);
  return (code?: string | string[], type: 'some' | 'every' = 'some') => {
    if (!code) return true;
    else if (typeof code === 'string') {
      return permissions.includes(code);
    } else if (Array.isArray(code)) {
      return code[type](i => permissions.includes(i));
    }
  };
};

export default usePermission;