import OSS, { Checkpoint } from 'ali-oss';
import BusinessType from './businessType';
import { apiGetOssToken, apiGetSignStstoken } from './service';
import { compressImage, isImgFile } from '@/utils/tools';
import axios from 'axios';
import { GetAliossTokenParams } from './types';
import { layer } from 'navyd';
interface UploadFileParams {
  file: File;
  businessType: BusinessType;
  callback?: CallableFunction; // 分片上传的时候 参数为 0 - 1范围
}

interface ClientItem {
  client: any; // 根据OSS客户端类型替换
  signExpiretime: number;
  fetching: boolean;
  promise?: Promise<any>;
}

// 签名
const initSignClient = (() => {
  const clientMap = new Map<string, ClientItem>();
  // 判断客户端是否有效
  const isClientValid = async (item?: ClientItem): Promise<boolean> => {
    if (!item?.client) return false;
    const res = await axios('/');
    const serverTime = new Date(res.headers.date).valueOf();
    return serverTime < item.signExpiretime;
  };

  return async (ossBusiness?: BusinessType) => {
    const businessKey = ossBusiness || 'empty';
    let item = clientMap.get(businessKey);

    // 初始化条目
    if (!item) {
      item = { client: null, signExpiretime: 0, fetching: false };
      clientMap.set(businessKey, item);
    }

    // 客户端有效则直接返回
    const f = await isClientValid(item);
    if (f) return item.client;

    // 如果正在获取，返回现有Promise
    if (item.fetching) return item.promise;

    // 标记为正在获取
    item.fetching = true;
    try {
      item.promise = (async () => {
        try {
          const res = await apiGetSignStstoken(ossBusiness);

          // 更新客户端配置
          const { expiration, ...config } = res.data;
          item.signExpiretime = new Date(expiration).valueOf();
          item.client = new OSS({
            region: config.region,
            accessKeyId: config.accessKeyId,
            accessKeySecret: config.accessKeySecret,
            bucket: config.bucket,
            stsToken: config.securityToken,
            endpoint: config.endpoint,
            cname: config.cname
          });

          return item.client;
        } catch (error) {
          return Promise.reject(error);
        }
      })();

      // 等待获取完成并返回客户端
      return await item.promise;
    } catch (error) {
      // 错误时重置状态
      item.fetching = false;
      item.promise = undefined;
      throw error;
    } finally {
      // 确保最终状态重置
      item.fetching = false;
    }
  };
})();


interface GetSignedUrlParams {
  src: string;
  ossBusiness?: BusinessType;
  // 完整的文件名，包含后缀
  filename?: string;
}
const getSignedUrl = async ({ src, ossBusiness, filename }: GetSignedUrlParams) => {
  try {
  // eslint-disable-next-line no-useless-escape
    const o = src.replace(/^(https?:\/\/)?[^\/]+/, '').replace(/^\/+/, '');
    const client = await initSignClient(ossBusiness);
    const signatureUrl = await client.signatureUrl(o, {
      response: {
        'content-disposition': `attachment; filename=${filename}`
      }
    });
    return signatureUrl;
  } catch (e) {
    return Promise.reject(e);
  }
};


const initUploadClient = async (params: GetAliossTokenParams) => {
  const res = await apiGetOssToken(params);
  const prop = res.data;
  const client = new OSS({
    region: prop.region,
    accessKeyId: prop.accessKeyId,
    accessKeySecret: prop.accessKeySecret,
    bucket: prop.bucket,
    stsToken: prop.securityToken,
    endpoint: prop.endpoint,
    cname: prop.cname
  });
  const options = {
    callback: {
      url: res.data.uploadCallbackUrl,
      body: 'bucket=${bucket}&object=${object}&etag=${etag}&size=${size}&mimeType=${mimeType}&imageInfo.height=${imageInfo.height}&imageInfo.width=${imageInfo.width}&imageInfo.format=${imageInfo.format}'
    },
    headers: res.data.headers
  };
  return {
    client,
    config: res.data,
    options
  };
};

let endPoint: Checkpoint | null;
const uploadFileToAlioss = async (props: UploadFileParams) => {
  try {
    const fileType = props.file.name.includes('.') ? props.file.name.split('.').pop() as string : 'png';
    const { client, config, options } = await initUploadClient({
      ossBusiness: props.businessType,
      fileExt: fileType,
      fileSizeB: props.file.size
    });
    let { file } = props;
    // 如果文件类型是图片的时候 要压缩一下
    if (isImgFile(fileType)) {
      file = await compressImage(file);
    }
    const res = await client.multipartUpload(config.limitObjectKey, file, {
      ...options,
      progress: function (p: number) {
        props.callback && props.callback(p);
        if (p === 1) {
          endPoint = null;
        }
      },
      checkpoint: endPoint as Checkpoint
    });
    const r = res.res as any;
    const url = r.requestUrls[0].split('?')[0] as string;

    return url;
  } catch (e: any) {
    layer.error(e.message || '上传失败');
    console.error(e);
    endPoint = null;
    return Promise.reject(e);
  }
};

export {
  uploadFileToAlioss,
  getSignedUrl
};