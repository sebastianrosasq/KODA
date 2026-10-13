import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { KodaButton, KodaIconButton, KodaPill } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';
import type { DayLabel } from '@/types/koda-domain';

const dayOptions: DayLabel[] = ['Hoy', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function dateInDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function PlanEditorModal({ onClose }: { onClose: () => void }) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const { addExam, addTopic, updateAvailability, workspace } = useKodaData();
  const activeCourses = useMemo(() => workspace.courses.filter((course) => course.isActive), [workspace.courses]);
  const [courseId, setCourseId] = useState(activeCourses[0]?.id ?? '');
  const [examTitle, setExamTitle] = useState('Examen parcial');
  const [examDate, setExamDate] = useState(dateInDays(3));
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [topicName, setTopicName] = useState('');
  const [slotDay, setSlotDay] = useState<DayLabel>('Vie');
  const [slotTime, setSlotTime] = useState('18:30');
  const [slotMinutes, setSlotMinutes] = useState('45');
  const [message, setMessage] = useState<string | null>(null);

  const addNewExam = () => {
    if (!courseId || !examTitle.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
      setMessage('Completa curso, nombre y fecha con el formato AAAA-MM-DD.');
      return;
    }
    addExam({ courseId, title: examTitle.trim(), dateIso: examDate, difficulty });
    setExamTitle('Examen parcial');
    setMessage('Examen agregado. KODA reajustó la prioridad del plan.');
  };

  const addNewTopic = () => {
    if (!courseId || !topicName.trim()) {
      setMessage('Escribe un tema y elige un curso.');
      return;
    }
    addTopic({ courseId, name: topicName.trim(), priority: difficulty });
    setTopicName('');
    setMessage('Tema agregado al plan.');
  };

  const addNewSlot = () => {
    const durationMinutes = Number(slotMinutes);
    if (!/^\d{2}:\d{2}$/.test(slotTime) || !Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 180) {
      setMessage('Usa una hora como 18:30 y una duración entre 15 y 180 minutos.');
      return;
    }
    updateAvailability([
      ...workspace.availability,
      { id: `slot-${Date.now()}`, day: slotDay, startsAt: slotTime, durationMinutes },
    ]);
    setMessage('Bloque disponible agregado.');
  };

  const removeSlot = (slotId: string) => {
    updateAvailability(workspace.availability.filter((slot) => slot.id !== slotId));
  };

  return (
    <Modal animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={onClose} transparent visible>
      <Pressable accessibilityLabel="Cerrar organizador" onPress={onClose} style={[styles.overlay, { backgroundColor: theme.overlay + '99' }]}>
        <Pressable onPress={() => undefined} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: theme.text }]}>Organiza tu semana</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>KODA actualizará el plan cuando cambies exámenes, temas u horas.</Text>
              </View>
              <KodaIconButton icon="close" label="Cerrar" onPress={onClose} />
            </View>

            {!activeCourses.length ? (
              <View style={[styles.notice, { backgroundColor: theme.warningSoft }]}>
                <Ionicons color={theme.warning} name="information-circle-outline" size={19} />
                <Text style={[styles.noticeText, { color: theme.textSecondary }]}>Activa al menos un curso desde Perfil para organizar tu plan.</Text>
              </View>
            ) : (
              <>
                <SectionLabel label="CURSO" color={theme.textSecondary} />
                <View style={styles.pills}>
                  {activeCourses.map((course) => (
                    <KodaPill key={course.id} label={course.name} onPress={() => setCourseId(course.id)} selected={courseId === course.id} />
                  ))}
                </View>

                <SectionLabel label="NUEVO EXAMEN" color={theme.textSecondary} />
                <TextInput
                  accessibilityLabel="Nombre del examen"
                  onChangeText={setExamTitle}
                  placeholder="Examen parcial"
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  value={examTitle}
                />
                <TextInput
                  accessibilityLabel="Fecha del examen"
                  onChangeText={setExamDate}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  value={examDate}
                />
                <DifficultyPicker difficulty={difficulty} onChange={setDifficulty} />
                <KodaButton icon="calendar-outline" label="Agregar examen" onPress={addNewExam} />

                <SectionLabel label="TEMA PENDIENTE" color={theme.textSecondary} />
                <TextInput
                  accessibilityLabel="Nombre del tema"
                  onChangeText={setTopicName}
                  placeholder="Ejemplo: patrones de diseño"
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  value={topicName}
                />
                <KodaButton icon="add-outline" label="Agregar tema" onPress={addNewTopic} variant="secondary" />
              </>
            )}

            <SectionLabel label="BLOQUES DISPONIBLES" color={theme.textSecondary} />
            <View style={styles.pills}>
              {dayOptions.map((day) => <KodaPill key={day} label={day} onPress={() => setSlotDay(day)} selected={slotDay === day} />)}
            </View>
            <View style={styles.slotInputs}>
              <TextInput
                accessibilityLabel="Hora del bloque"
                onChangeText={setSlotTime}
                placeholder="18:30"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, styles.timeInput, { borderColor: theme.border, color: theme.text }]}
                value={slotTime}
              />
              <TextInput
                accessibilityLabel="Duración del bloque en minutos"
                keyboardType="number-pad"
                onChangeText={setSlotMinutes}
                placeholder="45"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, styles.minutesInput, { borderColor: theme.border, color: theme.text }]}
                value={slotMinutes}
              />
            </View>
            <KodaButton icon="time-outline" label="Añadir bloque" onPress={addNewSlot} variant="secondary" />
            <View style={styles.slotList}>
              {workspace.availability.map((slot) => (
                <View key={slot.id} style={[styles.slotRow, { borderColor: theme.border }]}>
                  <Text style={[styles.slotText, { color: theme.text }]}>{slot.day} · {slot.startsAt} · {slot.durationMinutes} min</Text>
                  <KodaIconButton icon="trash-outline" label={`Eliminar bloque ${slot.day} ${slot.startsAt}`} onPress={() => removeSlot(slot.id)} />
                </View>
              ))}
            </View>
            {message ? <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text> : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DifficultyPicker({ difficulty, onChange }: { difficulty: 1 | 2 | 3; onChange: (difficulty: 1 | 2 | 3) => void }) {
  const { theme } = useKodaTheme();
  return (
    <View style={styles.pills}>
      {([1, 2, 3] as const).map((level) => (
        <KodaPill key={level} label={['Baja', 'Media', 'Alta'][level - 1]} onPress={() => onChange(level)} selected={difficulty === level} />
      ))}
      <Text style={[styles.difficultyHint, { color: theme.textTertiary }]}>Dificultad</Text>
    </View>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.sectionLabel, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', padding: KodaSpacing.md },
  card: { borderRadius: KodaRadius.lg, borderWidth: 1, maxHeight: '92%', maxWidth: 560, padding: KodaSpacing.xl, width: '100%' },
  content: { gap: KodaSpacing.md },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.md, justifyContent: 'space-between' },
  headerCopy: { flex: 1 },
  title: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 3 },
  sectionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginTop: KodaSpacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: KodaSpacing.sm },
  input: { borderRadius: KodaRadius.md, borderWidth: 1, fontSize: 16, minHeight: 50, paddingHorizontal: KodaSpacing.md },
  slotInputs: { flexDirection: 'row', gap: KodaSpacing.sm },
  timeInput: { flex: 1.2 },
  minutesInput: { flex: 0.8 },
  notice: { alignItems: 'flex-start', borderRadius: KodaRadius.md, flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.md },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  slotList: { gap: KodaSpacing.xs },
  slotRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: KodaSpacing.sm, paddingVertical: KodaSpacing.sm },
  slotText: { flex: 1, fontSize: 13, fontWeight: '700' },
  difficultyHint: { alignSelf: 'center', fontSize: 12, fontWeight: '600' },
  message: { fontSize: 13, fontWeight: '700', lineHeight: 18, paddingVertical: KodaSpacing.sm },
});
