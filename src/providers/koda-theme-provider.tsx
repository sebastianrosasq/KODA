import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { KodaThemes, type KodaColorScheme, type KodaPalette } from '@/constants/koda-theme';

type KodaThemeContextValue = {
  colorScheme: KodaColorScheme;
  theme: KodaPalette;
  setColorScheme: (colorScheme: KodaColorScheme) => void;
  toggleColorScheme: () => void;
};

const KodaThemeContext = createContext<KodaThemeContextValue | null>(null);

export function KodaThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [selectedColorScheme, setSelectedColorScheme] = useState<KodaColorScheme | null>(null);
  const colorScheme = selectedColorScheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');

  const setColorScheme = useCallback((nextColorScheme: KodaColorScheme) => {
    setSelectedColorScheme(nextColorScheme);
  }, []);

  const toggleColorScheme = useCallback(() => {
    setSelectedColorScheme((currentColorScheme) => {
      const activeColorScheme = currentColorScheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
      return activeColorScheme === 'dark' ? 'light' : 'dark';
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
