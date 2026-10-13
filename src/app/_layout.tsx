import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { KodaAuthProvider } from '@/providers/koda-auth-provider';
import { KodaDataProvider } from '@/providers/koda-data-provider';
import { KodaThemeProvider, useKodaTheme } from '@/providers/koda-theme-provider';

export default function RootLayout() {
  return (
    <KodaThemeProvider>
      <KodaAuthProvider>
        <KodaDataProvider>
          <KodaNavigation />
        </KodaDataProvider>
      </KodaAuthProvider>
    </KodaThemeProvider>
  );
}
function KodaNavigation() {
  const { colorScheme, theme } = useKodaTheme();
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.accent,
      background: theme.background,
      card: theme.tabBar,
      text: theme.text,
      border: theme.border,
      notification: theme.accent,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textTertiary,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: 76,
            paddingTop: 8,
          },
          sceneStyle: { backgroundColor: theme.background },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="plan"
          options={{
            title: 'Plan',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'calendar' : 'calendar-outline'} size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="review"
          options={{
            title: 'Repaso',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'layers' : 'layers-outline'} size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progreso',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'stats-chart' : 'stats-chart-outline'} size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons color={color} name={focused ? 'person' : 'person-outline'} size={22} />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
