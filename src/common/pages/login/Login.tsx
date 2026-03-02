import { LoginParams, LoginProps } from './types';
import React, { useMemo, useState, useEffect } from 'react';
import { Input, Checkbox, Divider, Button } from 'antd';
import switchImg from '../../../assets/images/switch-login.png';
import { useReactive } from 'ahooks';
import md5 from 'md5';
import classNames from 'classnames';
import style from './Login.module.less';
import { Tabs } from 'navyd';

const rememberUsernameKey = `${location.origin}-username`;
const Login: React.FC<LoginProps> = props => {
  const {
    bgImg,
    loginWays = ['account'],
    title,
    thirdPartyLoginWays = [],
    signup = true,
    miniCard = false,
    cardBgImg = '',
    onScanLoginChange
  } = props;

  const allTabs = [
    { value: 'account', label: '账密登录' },
    { value: 'smscode', label: '验证码登录' },
    { value: 'emailcode', label: '邮箱登录' }
  ];
  const [activeKey, setActiveKey] = useState('');
  const [isScanLogin, setIsScanLogin] = useState(false);

  const state = useReactive<LoginParams>({
    username: '',
    password: '',
    mobile: '',
    email: '',
    smscode: '',
    emailcode: ''
  });

  const model = useReactive({
    interval: null as null | number,
    countDown: 0,
    remberUsername: false,
    saveLoading: false
  });

  useEffect(() => {
    const username = localStorage.getItem(rememberUsernameKey);
    if (username) {
      state.username = username;
      model.remberUsername = true;
    }
    setIsScanLogin(loginWays[0] === 'scan');
    const defaultKey = typeof loginWays === 'string' ? loginWays : loginWays.filter(i => i !== 'scan')[0];
    setActiveKey(defaultKey);
    return () => clearInterval(model.interval as number);
  }, []);

  // 是否有第三方登录
  const hasThirdPartyLogin = useMemo(() => {
    return thirdPartyLoginWays.length > 0;
  }, [thirdPartyLoginWays]);

  // 是否有扫码登录按钮
  const hasScanLogin = useMemo(() => {
    return loginWays.includes('scan') && loginWays.length > 1;
  }, [loginWays]);

  // 是否只有扫码登录
  const ifOnlyScan = useMemo(() => {
    return loginWays === 'scan' || (loginWays.includes('scan') && loginWays.length === 1);
  }, [loginWays]);

  // 是否有tabs
  const hasTabs = useMemo(() => {
    const length = loginWays.length;
    const includesScan = loginWays.includes('scan');
    return (includesScan && length > 2) || (!includesScan && length > 1);
  }, [loginWays]);

  const tabsOptions = useMemo(() => {
    if (hasTabs) {
      return allTabs.filter(i => loginWays.includes(i.value));
    }
    else return [];
  }, [hasTabs]);

  const bgStyle = {
    backgroundImage: `url(${bgImg})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  };

  const cardBgStyle = {
    backgroundImage: `url(${cardBgImg})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  };

  const tabChange = (key: string) => {
    setActiveKey(key);
  };

  const isScanLoginChange = () => {
    const v = !isScanLogin;
    if (v) {
      onScanLoginChange && onScanLoginChange(v);
    }
    setIsScanLogin(v);
  };


  const stateChange = (filed: keyof typeof state, value: string) => {
    state[filed] = value;
  };

  const getSmscode = async () => {
    if (model.countDown) return;
    if (props.onGetSmscode) {
      const f = await props.onGetSmscode(state.mobile);
      if (f) {
        if (model.countDown) return;
        model.countDown = 60;
        model.interval = setInterval(() => {
          if (model.countDown <= 0) {
            clearInterval(model.interval as number);
            model.interval = null;
          } else {
            model.countDown -= 1;
          }
        }, 1000);
      }
    }
  };
  // 获取验证码
  const SendCode = useMemo(() => {
    return <span onClick={getSmscode} className="uni-getcode-btn">
      { model.countDown ? `${model.countDown}秒后可重发` : '获取验证码' }
    </span>;
  }, [model.countDown]);

  // 点击登录
  const login = async function () {
    try {
      model.saveLoading = true;
      props.onLogin && await props.onLogin({
        ...state,
        password: md5(state.password)
      }, activeKey);
      // 记住账号
      if (model.remberUsername) {
        localStorage.setItem(rememberUsernameKey, state.username);
      } else {
        localStorage.removeItem(rememberUsernameKey);
      }
    } finally {
      model.saveLoading = false;
    }
  };


  return (
    <div
      className={style['uni-login']}
      style={{
        ...bgStyle
      }}
    >
      <div className={style['uni-login-header']}>{ props.header }</div>
      <div className={classNames(style['uni-login-content'], miniCard && style['uni-login-content-mini'])}>
        {
          !miniCard ?
            <div>
              <div className={style['uni-login-title']}>{title}</div>
              <div
                className={style['uni-login-card-bg']}
                style={cardBgStyle}
              >
              </div>
            </div> :
            <div className={'uni-login-title'}>{title}</div>
        }
        <div className={style['uni-login-form']}>
          {
            !isScanLogin ? <>
              {
                (function () {
                  if (hasTabs) return <Tabs
                    options={tabsOptions}
                    value={activeKey}
                    onChange={tabChange}
                  />;
                  else if (ifOnlyScan) return null;
                  return <div className={style['uni-login-login-text']}>登&nbsp;&nbsp;录</div>;
                })()
              }
              {/* 登录方式 */}
              {
                (function () {
                  if (activeKey === 'account') return <div className={style['uni-login-form-account']}>
                    <Input
                      placeholder="请输入账号"
                      autoComplete="new-password"
                      value={state.username}
                      onChange={e => stateChange('username', e.target.value)}
                    />
                    <Input.Password
                      placeholder="请输入密码"
                      autoComplete="new-password"
                      value={state.password}
                      onChange={e => stateChange('password', e.target.value)}
                    />
                  </div>;
                  if (activeKey === 'smscode') return <div className={style['uni-login-form-smscode']}>
                    <Input
                      addonBefore="+86"
                      placeholder="请输入手机号"
                      value={state.mobile}
                      onChange={e => stateChange('mobile', e.target.value)}
                    />
                    <Input
                      addonAfter={SendCode}
                      placeholder="请输入验证码"
                      maxLength={6}
                      value={state.smscode}
                      onChange={e => stateChange('smscode', e.target.value)}
                    />
                  </div>;
                  if (activeKey === 'emailcode') return <div className={style['uni-login-form-emailcode']}>
                    <Input
                      placeholder="请输入邮箱"
                      value={state.email}
                      onChange={e => stateChange('email', e.target.value)}
                    />
                    <Input
                      addonAfter={SendCode}
                      placeholder="请输入验证码"
                      maxLength={6}
                      value={state.emailcode}
                      onChange={e => stateChange('emailcode', e.target.value)}
                    />
                  </div>;
                })()
              }
              {/* 记住账号 */}
              {
                activeKey === 'account' &&
                <div className={style['uni-login-remember']}>
                  <Checkbox
                    checked={model.remberUsername}
                    onChange={e => model.remberUsername = e.target.checked}
                  >
                    记住账号
                  </Checkbox>
                </div>
              }
              {/* 立即登录 */}
              {
                !ifOnlyScan &&
                <div className={style['uni-login-button']}>
                  <Button type="primary" onClick={login} loading={model.saveLoading}>立即登录</Button>
                </div>
              }
              {/* 第三方登录 */}
              {
                (function () {
                  if (hasThirdPartyLogin) {
                    return <>
                      <Divider className={style['uni-login-other']}>
                        <span className={style['uni-login-other-text']}>其他登录方式</span>
                      </Divider>
                      <div className={style['uni-login-third-party']}>
                        {
                          ...thirdPartyLoginWays
                        }
                      </div>
                    </>;
                  }
                })()
              }
            </> :
              <div>
                {/* TODO: app扫码登录  */}
              </div>
          }
          {/* 注册 */}
          { signup &&
            <div className={style['uni-login-register']}>
              <span>没有账号？</span>
              <span onClick={props.onClickSignup}>立即注册</span>
            </div>
          }

          {/* 扫码 账号 切换 */}
          {
            hasScanLogin &&
            <div className={style['uni-switch-login']} onClick={isScanLoginChange}>
              {
                isScanLogin ? <span className="iconfont icon-diannao"></span> :
                  <span className="iconfont icon-erweima"></span>
              }
              <img src={switchImg} alt="" className={style['uni-switch-login-logo']} />
            </div>
          }
        </div>
      </div>
      <div className="uni-login-footer">{ props.footer }</div>
    </div>
  );
};

export default Login;
