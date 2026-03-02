import { useThemeStore, ThemeMode } from '@/store/themeStore';

interface UseThemeReturn {
  mode: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const useTheme = (): UseThemeReturn => {
  const { mode, toggleTheme, setTheme } = useThemeStore();

  return {
    mode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    toggleTheme,
    setTheme
  };
};

export default useTheme;
export type { UseThemeReturn };
