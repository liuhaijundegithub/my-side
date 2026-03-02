// 身份证 检查省份ID
const checkProv = function (val: string) {
  const pattern = /^[1-9][0-9]/;
  const provs: Record<string, string> = { 11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古', 21: '辽宁', 22: '吉林', 23: '黑龙江 ', 31: '上海', 32: '江苏', 33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南', 42: '湖北 ', 43: '湖南', 44: '广东', 45: '广西', 46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南', 54: '西藏 ', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏', 65: '新疆', 71: '台湾', 81: '香港', 82: '澳门' };
  if (pattern.test(val)) {
    if (provs[val]) {
      return true;
    }
  }
  return false;
};
// 身份证 出生年月日期
const checkDate = function (val: string) {
  const pattern = /^(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)$/;
  if (pattern.test(val)) {
    const year = val.substring(0, 4);
    const month = val.substring(4, 6);
    const date = val.substring(6, 8);
    const date2 = new Date(year + '-' + month + '-' + date);
    if (date2 && date2.getMonth() === (parseInt(month) - 1)) {
      return true;
    }
  }
  return false;
};

// 身份证 校验码
const checkCode = function (val: string) {
  const p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
  const code = val.substring(17);
  if (p.test(val)) {
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += ((val[i] as unknown as number) * factor[i]);
    }
    // eslint-disable-next-line eqeqeq
    if (parity[sum % 11] == code.toUpperCase()) {
      return true;
    }
  }
  return false;
};

// 身份证号
export const isIdNumber = (val: string): boolean => {
  if (checkCode(val)) {
    const date = val.substring(6, 14);
    if (checkDate(date)) {
      if (checkProv(val.substring(0, 2))) {
        return true;
      }
    }
  }
  return false;
};


export const isPhoneReg = /^1[3456789]\d{9}$/;

/**
 * 是否为规范密码
 * 只含字母、数字、符号（-_/*+=.~!@#$%^&*()），长度为8-20
 *
 * @export
 * @param {string} str
 * @return {*}  {boolean}
 */

// 至少包含数字跟字母，可以有符号
export const isPwdReg = /^(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-_*/+=.~!@#$%^&*()]{8,20}$/;
export function isPwd (passsword: string | unknown): boolean {
  if (typeof passsword !== 'string') return false;
  return isPwdReg.test(passsword);
}

// 强密码：密码8-16位，需包含大写字母、小写字母、数字或特殊字符至少三种组合
export const isStrongPwdReg = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{8,16}$/;
export function isStrongPwd (passsword: string | unknown): boolean {
  if (typeof passsword !== 'string') return false;
  return isStrongPwdReg.test(passsword);
}