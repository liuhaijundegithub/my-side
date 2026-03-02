import { Button, Result } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import useRouter from '@hooks/useRouter.ts';
import { getOriginalWindowOpen } from '@/utils/externalLinkInterceptor.ts';
import uniConfig from '@/config';
import style from './index.module.less';

// 默认允许的协议
const DEFAULT_ALLOWED_PROTOCOLS = ['http:', 'https:'];

// 安全的 URL 验证函数（防止 XSS 攻击）
const isValidUrl = (url: string): { valid: boolean; url: string } => {
  // 1. 基本类型检查
  if (!url || typeof url !== 'string') {
    return { valid: false, url: '' };
  }

  // 2. 长度检查（防止过长的 URL）
  if (url.length > 2000) {
    console.warn('[Redirect] URL too long:', url.length);
    return { valid: false, url: '' };
  }

  // 3. 检查是否包含危险的 JavaScript 代码
  // 防止 javascript:、data:、vbscript: 等危险协议
  const dangerousPatterns = [
    /^javascript:/i,
    /^vbscript:/i,
    /^data:text\/html/i,
    /^x-javascript:/i,
    /<script/i,
    /on\w+\s*=/i // 匹配 onclick=, onload= 等事件处理器
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(url)) {
      console.error('[Redirect] Dangerous URL pattern detected:', url);
      return { valid: false, url: '' };
    }
  }

  // 4. URL 格式验证
  try {
    const urlObj = new URL(url);

    // 5. 协议白名单检查
    const allowedProtocols = uniConfig.externalLinkInterceptor?.allowedProtocols || DEFAULT_ALLOWED_PROTOCOLS;

    // 检查协议是否在允许列表中（支持 http/https）
    if (!DEFAULT_ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      // 如果配置了额外的允许协议（如 mailto:），也允许
      if (!allowedProtocols.some(protocol =>
        urlObj.protocol.toLowerCase() === protocol.toLowerCase().replace(':', '') + ':'
      )) {
        console.warn('[Redirect] Protocol not allowed:', urlObj.protocol);
        return { valid: false, url: '' };
      }
    }

    // 6. 返回清理后的 URL（URL 构造函数会自动转义）
    return { valid: true, url: urlObj.href };
  } catch (error) {
    console.error('[Redirect] Invalid URL format:', url, error);
    return { valid: false, url: '' };
  }
};

const Redirect = () => {
  const router = useRouter();
  const { target } = router.getSearchParams();
  const [isValid, setIsValid] = useState(false);
  const [displayUrl, setDisplayUrl] = useState('');
  const [cleanUrl, setCleanUrl] = useState('');

  useEffect(() => {
    if (target) {
      // 使用增强的 URL 验证函数
      const validation = isValidUrl(target);
      setIsValid(validation.valid);
      setDisplayUrl(target); // 显示原始 URL（让用户看到他们点击的内容）
      setCleanUrl(validation.url); // 使用清理后的 URL 进行跳转
    } else {
      setIsValid(false);
      setDisplayUrl('');
      setCleanUrl('');
    }
  }, [target]);

  const handleConfirm = () => {
    if (!isValid || !cleanUrl) return;

    try {
      // 使用保存的原始 window.open 方法
      const originalOpen = getOriginalWindowOpen();
      // 使用清理后的 URL，防止 XSS 攻击
      originalOpen.call(window, cleanUrl, '_blank', 'noopener,noreferrer');
      router.back();
    } catch (error) {
      console.error('[Redirect] Failed to open URL:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className={style['page-redirect']}>
      <div className='pt-10 pb-10 pl-14'>
        <Button
          type="link"
          icon={<LeftOutlined />}
          onClick={() => router.back()}
        >
          返回
        </Button>
      </div>

      <div className={style['content']}>
        <Result
          status="warning"
          title="即将跳转到外部网站"
          subTitle={
            <div className={style['sub-title']}>
              <p>您即将跳转到以下外部网站:</p>
              <div className={style['target-url']}>
                {displayUrl || '无效的链接'}
              </div>
              <p>请注意该网站的安全性，确认是否继续访问？</p>
            </div>
          }
          extra={[
            <Button key="cancel" onClick={handleCancel} className='mr-14'>
              取消
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={handleConfirm}
              disabled={!isValid}
            >
              继续访问
            </Button>
          ]}
        />
      </div>
    </div>
  );
};

export default Redirect;
