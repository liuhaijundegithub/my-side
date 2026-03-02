import BusinessType from './businessType';

export interface OSSToken {
  // 临时访问密钥（AccessKeyId和AccessKeySecret）和安全令牌（SecurityToken）。
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  // 临时凭证失效时间
  expiration: string;
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: string;
  bucket: string;
  // 存储地址
  customDomain: string;
  endpoint: string;
  pathPrefix: string; // "unknown/" ???
  cname: boolean;
  limitObjectKey: string; // 上传文件的目录
  headers: Record<string, string>; // 上传的头文件
  uploadCallbackUrl: string; // 上传完成之后的回调链接【后端需要统计】
}

export interface GetAliossTokenParams {
  ossBusiness: BusinessType;
  fileExt: string;
  fileSizeB: number; // 单位 B
  schoolId?: ID;
  suffix?: string;
  oldUrl?: string;
  appointName?: string;
}
