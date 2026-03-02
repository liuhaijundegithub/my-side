import config from '@/config';

const useLogin = () => {
  const hasToken = localStorage.getItem(config.ACCCESS_TOKEN_KEY);
  return { isLogin: Boolean(hasToken) };
};

export default useLogin;