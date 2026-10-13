export type KodaColorScheme = 'light' | 'dark';

export const KodaThemes = {
  light: {
    background: '#F7F7F4',
    surface: '#FFFFFF',
    surfaceMuted: '#EFEEEA',
    surfaceSubtle: '#E7E5E0',
    text: '#17171A',
    textSecondary: '#626169',
    textTertiary: '#85838B',
    accent: '#6D4AFF',
    accentStrong: '#5233D8',
    accentSoft: '#E9E3FF',
    onAccent: '#FFFFFF',
    success: '#19785C',
    successSoft: '#DDF5EA',
    warning: '#B56A05',
    warningSoft: '#FFF1D7',
    danger: '#B42318',
    border: '#E3E1DB',
    overlay: '#17171A',
    tabBar: '#FDFDFC',
    shadow: '#17171A',
  },
  dark: {
    background: '#0B0C0F',
    surface: '#15161B',
    surfaceMuted: '#202127',
    surfaceSubtle: '#292A31',
    text: '#F5F4F7',
    textSecondary: '#B8B5BF',
    textTertiary: '#85838E',
    accent: '#B7A5FF',
    accentStrong: '#D4CAFF',
    accentSoft: '#282344',
    onAccent: '#171329',
    success: '#6ED5AE',
    successSoft: '#123B2E',
    warning: '#FFC069',
    warningSoft: '#47300F',
    danger: '#FF9C97',
    border: '#2A2B33',
    overlay: '#000000',
    tabBar: '#121318',
    shadow: '#000000',
  },
} as const;

export type KodaPalette = (typeof KodaThemes)[KodaColorScheme];

export const KodaSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const KodaRadius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

export const KodaShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.07,
  shadowRadius: 18,
  elevation: 4,
} as const;
