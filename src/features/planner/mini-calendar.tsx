import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useKodaTheme } from '@/providers/koda-theme-provider';

const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function toDateIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateIso(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12);
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function changeMonth(date: Date, change: number) {
  return new Date(date.getFullYear(), date.getMonth() + change, 1, 12);
}

export function formatExamDate(dateIso: string) {
  return fromDateIso(dateIso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function MiniCalendar({
  value,
  onChange,
  minimumDate = toDateIso(new Date()),
}: {
  value: string;
  onChange: (dateIso: string) => void;
  minimumDate?: string;
}) {
  const { theme } = useKodaTheme();
  const [cursor, setCursor] = useState(() => monthStart(fromDateIso(value)));

  const calendarDays = useMemo(() => {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
    const firstWeekdayIndex = (firstDay.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), index - firstWeekdayIndex + 1, 12);
      return { date, iso: toDateIso(date), inCurrentMonth: date.getMonth() === cursor.getMonth() };
    });
  }, [cursor]);

  const previousMonthIsAvailable = monthStart(changeMonth(cursor, -1)).getTime() >= monthStart(fromDateIso(minimumDate)).getTime();
  const monthLabel = cursor.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });

  return (
    <View accessibilityLabel={`Calendario de ${monthLabel}`} style={[styles.calendar, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      <View style={styles.monthHeader}>
        <Pressable
          accessibilityLabel="Mes anterior"
          accessibilityRole="button"
          accessibilityState={{ disabled: !previousMonthIsAvailable }}
          disabled={!previousMonthIsAvailable}
          onPress={() => setCursor((current) => changeMonth(current, -1))}
          style={({ pressed }) => [styles.monthButton, { borderColor: theme.border }, pressed && styles.pressed, !previousMonthIsAvailable && styles.disabled]}>
          <Ionicons color={theme.text} name="chevron-back" size={18} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: theme.text }]}>{monthLabel}</Text>
        <Pressable
          accessibilityLabel="Mes siguiente"
          accessibilityRole="button"
          onPress={() => setCursor((current) => changeMonth(current, 1))}
          style={({ pressed }) => [styles.monthButton, { borderColor: theme.border }, pressed && styles.pressed]}>
          <Ionicons color={theme.text} name="chevron-forward" size={18} />
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {weekdays.map((day) => <Text key={day} style={[styles.weekday, { color: theme.textTertiary }]}>{day}</Text>)}
      </View>
      <View style={styles.days}>
        {calendarDays.map(({ date, iso, inCurrentMonth }) => {
          const selected = iso === value;
          const unavailable = !inCurrentMonth || iso < minimumDate;
          return (
            <Pressable
              key={iso}
              accessibilityLabel={`${date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}${selected ? ', seleccionada' : ''}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: unavailable, selected }}
              disabled={unavailable}
              onPress={() => onChange(iso)}
              style={({ pressed }) => [
                styles.day,
                selected && { backgroundColor: theme.accent },
                pressed && !unavailable && styles.pressed,
              ]}>
              <Text style={[
                styles.dayLabel,
                { color: selected ? theme.onAccent : unavailable ? theme.textTertiary : theme.text },
                unavailable && styles.unavailableDay,
              ]}>{date.getDate()}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { borderRadius: KodaRadius.md, borderWidth: 1, gap: KodaSpacing.sm, padding: KodaSpacing.md },
  monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  monthButton: { alignItems: 'center', borderRadius: KodaRadius.sm, borderWidth: 1, height: 34, justifyContent: 'center', width: 34 },
  monthLabel: { fontSize: 14, fontWeight: '900', textTransform: 'capitalize' },
  weekdays: { flexDirection: 'row' },
  weekday: { flex: 1, fontSize: 10, fontWeight: '900', textAlign: 'center' },
  days: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { alignItems: 'center', aspectRatio: 1, justifyContent: 'center', width: `${100 / 7}%` },
  dayLabel: { fontSize: 13, fontWeight: '800' },
  unavailableDay: { opacity: 0.35 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.4 },
});
