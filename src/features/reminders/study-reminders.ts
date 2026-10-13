import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import type { AvailabilityBlock, DayLabel } from '@/types/koda-domain';

const CHANNEL_ID = 'study-reminders';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function weekdayFor(day: DayLabel) {
  const weekdays: Record<Exclude<DayLabel, 'Hoy'>, number> = {
    Dom: 1,
    Lun: 2,
    Mar: 3,
    Mié: 4,
    Jue: 5,
    Vie: 6,
    Sáb: 7,
  };
  return day === 'Hoy' ? new Date().getDay() + 1 : weekdays[day];
}

function reminderTime(startsAt: string) {
  const [hours, minutes] = startsAt.split(':').map(Number);
  const totalMinutes = (hours || 0) * 60 + (minutes || 0) - 15;
  const normalized = (totalMinutes + 24 * 60) % (24 * 60);
  return { hour: Math.floor(normalized / 60), minute: normalized % 60, previousDay: totalMinutes < 0 };
}

export type ReminderScheduleResult =
  | { status: 'scheduled'; count: number }
  | { status: 'unavailable'; message: string }
  | { status: 'permission_denied'; message: string };

export async function scheduleStudyReminders(blocks: AvailabilityBlock[]): Promise<ReminderScheduleResult> {
  if (Platform.OS === 'web') {
    return { status: 'unavailable', message: 'Los recordatorios se activan desde la APK para Android o iOS.' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Sesiones de estudio',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150],
      lightColor: '#6D5FA8',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') {
    return { status: 'permission_denied', message: 'KODA necesita permiso para avisarte antes de cada bloque.' };
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  const activeBlocks = blocks.filter((block) => block.durationMinutes > 0);
  await Promise.all(activeBlocks.map(async (block) => {
    const time = reminderTime(block.startsAt);
    const weekday = ((weekdayFor(block.day) - 1 + (time.previousDay ? 6 : 0)) % 7) + 1;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tu bloque de estudio empieza pronto',
        body: `En 15 minutos: ${block.durationMinutes} min para avanzar en tu plan KODA.`,
        data: { url: '/plan' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: time.hour,
        minute: time.minute,
        channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
      },
    });
  }));

  return { status: 'scheduled', count: activeBlocks.length };
}

export function useStudyReminderNavigation() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const redirect = (response: Notifications.NotificationResponse | null) => {
      const url = response?.notification.request.content.data?.url;
      if (url === '/plan') router.push('/plan');
    };

    redirect(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(redirect);
    return () => subscription.remove();
  }, []);
}
