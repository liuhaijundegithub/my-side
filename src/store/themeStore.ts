import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      toggleTheme: () => {
        const newMode = get().mode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
        document.documentElement.setAttribute('data-theme', newMode);
      },
      setTheme: (mode: ThemeMode) => {
        set({ mode });
        document.documentElement.setAttribute('data-theme', mode);
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 恢复存储时应用主题
        if (state) {
          document.documentElement.setAttribute('data-theme', state.mode);
        }
      }
    }
  )
);

export type { ThemeMode };
