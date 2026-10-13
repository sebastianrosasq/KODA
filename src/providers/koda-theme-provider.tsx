import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { KodaThemes, type KodaColorScheme, type KodaPalette } from '@/constants/koda-theme';

type KodaThemeContextValue = {
  colorScheme: KodaColorScheme;
  theme: KodaPalette;
  setColorScheme: (colorScheme: KodaColorScheme) => void;
  toggleColorScheme: () => void;
};

const KodaThemeContext = createContext<KodaThemeContextValue | null>(null);
const THEME_STORAGE_KEY = '@koda/color-scheme-v1';

export function KodaThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [selectedColorScheme, setSelectedColorScheme] = useState<KodaColorScheme | null>(null);
  const colorScheme = selectedColorScheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    let active = true;

    void AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedColorScheme) => {
        if (active && (storedColorScheme === 'light' || storedColorScheme === 'dark')) {
          setSelectedColorScheme(storedColorScheme);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const setColorScheme = useCallback((nextColorScheme: KodaColorScheme) => {
    setSelectedColorScheme(nextColorScheme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, nextColorScheme).catch(() => undefined);
  }, []);

  const toggleColorScheme = useCallback(() => {
    setSelectedColorScheme((currentColorScheme) => {
      const activeColorScheme = currentColorScheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
      const nextColorScheme = activeColorScheme === 'dark' ? 'light' : 'dark';
      void AsyncStorage.setItem(THEME_STORAGE_KEY, nextColorScheme).catch(() => undefined);
      return nextColorScheme;
    });
  }, [systemColorScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      theme: KodaThemes[colorScheme],
      setColorScheme,
      toggleColorScheme,
    }),
    [colorScheme, setColorScheme, toggleColorScheme],
  );

  return <KodaThemeContext.Provider value={value}>{children}</KodaThemeContext.Provider>;
}

export function useKodaTheme() {
  const context = useContext(KodaThemeContext);

  if (!context) {
    throw new Error('useKodaTheme debe usarse dentro de KodaThemeProvider.');
  }

  return context;
}
