import service from '@/common/ajax';


interface GetTeacherListParams {
  search?: string;
  unameLike?: string;
  mobile?: string;
  gradeDcode?: string;
  coursetypeDcode?: string;
  pageNum: number;
  pageSize: number;
  includeStaff?: boolean;
  courseId?: ID;
  termId?: ID;
}

export interface Teacher {
  accessImageUrl: string;
  gender: null;
  headImageUrl: string;
  id: number;
  idImageUrl: string;
  identityDcode: string;
  identityValue: string;
  lastPwdDt: null;
  mobile: string;
  name: string;
  namePinyin: string;
  nickname: string;
  signatureUrl: string;
  source: string;
  status: string;
  userType: string;
  username: string;
}
export const apiGetTeacherList = (params: GetTeacherListParams) =>
  service<BackendPaginationData<Teacher[]>>('/basicdata/common/schoolteacher/list', { data: params });