import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { KodaAuthProvider, useKodaAuth } from '@/providers/koda-auth-provider';
import { KodaDataProvider, useKodaData } from '@/providers/koda-data-provider';
import { KodaThemeProvider, useKodaTheme } from '@/providers/koda-theme-provider';
import { syncStudyRemindersIfPermitted, useStudyReminderNavigation } from '@/features/reminders/study-reminders';
import { AcademicOnboardingModal } from '@/features/onboarding/academic-onboarding-modal';
import { KodaAccessGate } from '@/features/auth/koda-access-gate';

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
  const { status } = useKodaAuth();
  const { hydrated, workspace } = useKodaData();
  useStudyReminderNavigation();
  const availabilityKey = workspace.availability.map((block) => `${block.id}:${block.day}:${block.startsAt}:${block.durationMinutes}`).join('|');
  useEffect(() => {
    if (status !== 'signed_in' || !hydrated || !workspace.academicProfileCompleted) return;
    void syncStudyRemindersIfPermitted(workspace.availability);
  }, [availabilityKey, hydrated, status, workspace.academicProfileCompleted, workspace.availability]);
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

  if (status !== 'signed_in') {
    return (
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <KodaAccessGate isChecking={status === 'checking'} isUnavailable={status === 'unavailable'} />
      </ThemeProvider>
    );
  }

  if (!hydrated || !workspace.academicProfileCompleted) {
    return (
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={{ backgroundColor: theme.background, flex: 1 }} />
        {hydrated ? <AcademicOnboardingModal /> : null}
      </ThemeProvider>
    );
  }

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
        <Tabs.Screen name="materials" options={{ href: null }} />
        <Tabs.Screen name="simulations" options={{ href: null }} />
        <Tabs.Screen name="coach" options={{ href: null }} />
      </Tabs>
    </ThemeProvider>
  );
}
