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

export type StudyReminderStatus =
  | { status: 'active'; count: number; message: string }
  | { status: 'inactive'; message: string }
  | { status: 'permission_required'; message: string }
  | { status: 'unavailable'; message: string };

function isKodaStudyReminder(request: Notifications.NotificationRequest) {
  return request.content.data?.kodaReminder === true;
}

async function clearKodaStudyReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(isKodaStudyReminder)
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );
}

export async function getStudyReminderStatus(): Promise<StudyReminderStatus> {
  if (Platform.OS === 'web') {
    return { status: 'unavailable', message: 'Los avisos se activan cuando instales KODA en tu teléfono.' };
  }

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    return { status: 'permission_required', message: 'Actívalos una vez para permitir que KODA te avise antes de estudiar.' };
  }

  const count = (await Notifications.getAllScheduledNotificationsAsync()).filter(isKodaStudyReminder).length;
  return count
    ? { status: 'active', count, message: `${count} recordatorios semanales activos.` }
    : { status: 'inactive', message: 'Actívalos para recibir un aviso 15 minutos antes de cada bloque.' };
}

export async function scheduleStudyReminders(
  blocks: AvailabilityBlock[],
  options: { requestPermission?: boolean } = {},
): Promise<ReminderScheduleResult> {
  if (Platform.OS === 'web') {
    return { status: 'unavailable', message: 'Los avisos se activan cuando instales KODA en tu teléfono.' };
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
  const permission = current.status === 'granted' || options.requestPermission === false
    ? current
    : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') {
    return { status: 'permission_denied', message: 'KODA necesita permiso para avisarte antes de cada bloque.' };
  }

  await clearKodaStudyReminders();
  const activeBlocks = blocks.filter((block) => block.durationMinutes > 0);
  await Promise.all(activeBlocks.map(async (block) => {
    const time = reminderTime(block.startsAt);
    const weekday = ((weekdayFor(block.day) - 1 + (time.previousDay ? 6 : 0)) % 7) + 1;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tu bloque de estudio empieza pronto',
        body: `En 15 minutos: ${block.durationMinutes} min para avanzar en tu plan KODA.`,
        data: { url: '/plan', kodaReminder: true },
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

export async function syncStudyRemindersIfPermitted(blocks: AvailabilityBlock[]) {
  if (Platform.OS === 'web') return;
  await scheduleStudyReminders(blocks, { requestPermission: false });
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
