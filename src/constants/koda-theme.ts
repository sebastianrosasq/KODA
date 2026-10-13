export type KodaColorScheme = 'light' | 'dark';

export const KodaThemes = {
  light: {
    background: '#F8F7F5',
    surface: '#FEFDFC',
    surfaceMuted: '#F1EEEA',
    surfaceSubtle: '#E8E3E5',
    text: '#1C1A1E',
    textSecondary: '#69636C',
    textTertiary: '#908994',
    accent: '#6B5A70',
    accentStrong: '#4D4052',
    accentSoft: '#EEE9EE',
    onAccent: '#FFFFFF',
    success: '#19785C',
    successSoft: '#DDF5EA',
    warning: '#B56A05',
    warningSoft: '#FFF1D7',
    danger: '#B42318',
    border: '#E7E0E4',
    overlay: '#1C1A1E',
    tabBar: '#FDFCFA',
    shadow: '#2A222B',
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
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.055,
  shadowRadius: 16,
  elevation: 3,
} as const;
