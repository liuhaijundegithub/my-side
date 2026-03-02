import service from '@/common/ajax/index';
import { GetAliossTokenParams, OSSToken } from './types';
import BusinessType from './businessType';

export const apiGetOssToken = (data: GetAliossTokenParams) =>
  service<BackendData<OSSToken>>('general/common/aliyun/oss/ststoken/bybusiness', { data });

// 获取签名的 sts token
export const apiGetSignStstoken = (ossBusiness?: BusinessType) =>
  service<BackendData<OSSToken>>('general/common/aliyun/oss/ststoken/forread/byschool', { data: { ossBusiness } });