import MobileDetect from 'mobile-detect'; // https://hgoebl.github.io/mobile-detect.js/doc/MobileDetect.html 文档地址

export const useClientType = () => {
  const userAgent = window.navigator.userAgent;
  const md = new MobileDetect(userAgent);
  const isWx = md.userAgent() === 'wechat';
  const isPhone = Boolean(md.mobile());
  const isIos = md.os() === 'ios';
  const isTablet = md.tablet();

  const detectDeviceType = (): 'phone' | 'tablet' | 'desktop' => {
    if (md.mobile()) {
      return md.tablet() ? 'tablet' : 'phone';
    }
    return 'desktop';
  };
  const getFinalDeviceType = () => {
    const deviceType = detectDeviceType();
    // 平板设备
    if (deviceType === 'tablet') {
      return 'phone';
    }
    // 桌面设备
    if (deviceType === 'desktop') {
      return 'computer';
    }
    // 手机设备
    return 'phone';
  };

  return {
    md,
    isWx,
    isPhone,
    isIos,
    isTablet,
    detectDeviceType,
    getFinalDeviceType
  };
};

export default useClientType;