export interface LoginParams {
  username: string;
  mobile: string;
  email: string;
  password: string;
  smscode: string;
  emailcode: string;
}

export interface LoginProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  bgImg?: string;
  cardBgImg?: string;
  title: string;
  loginWays?: string[] | string;
  thirdPartyLoginWays?: React.ReactNode[];
  signup?: boolean;
  onClickSignup?: () => void;
  onScanLoginChange?: (isScanLogin: boolean) => void;
  onGetSmscode?: (phone: string) => Promise<any>;
  onLogin: (params: LoginParams, loginWay: string) => Promise<any> | void;
  miniCard?: boolean;
}
