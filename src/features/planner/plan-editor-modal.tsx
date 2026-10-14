import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { KodaButton, KodaIconButton, KodaPill } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatExamDate, MiniCalendar } from '@/features/planner/mini-calendar';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';
import type { DayLabel } from '@/types/koda-domain';

const dayOptions: DayLabel[] = ['Hoy', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function dateInDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function PlanEditorModal({ onClose, onExamAdded }: { onClose: () => void; onExamAdded: (title: string) => void }) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const { addExam, addTopic, removeExam, updateAvailability, workspace } = useKodaData();
  const activeCourses = useMemo(() => workspace.courses.filter((course) => course.isActive), [workspace.courses]);
  const upcomingExams = useMemo(
    () => workspace.exams.slice().sort((left, right) => left.dateIso.localeCompare(right.dateIso)),
    [workspace.exams],
  );
  const [courseId, setCourseId] = useState(activeCourses[0]?.id ?? '');
  const [examTitle, setExamTitle] = useState('Examen parcial');
  const [examDate, setExamDate] = useState(dateInDays(3));
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [topicName, setTopicName] = useState('');
  const [slotDay, setSlotDay] = useState<DayLabel>('Vie');
  const [slotTime, setSlotTime] = useState('18:30');
  const [slotMinutes, setSlotMinutes] = useState('45');

  const addNewExam = () => {
    if (!courseId || !examTitle.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(examDate) || examDate < dateInDays(0)) {
      Alert.alert('Revisa la evaluación', 'Elige un curso, nombra la evaluación y selecciona una fecha desde el calendario.');
      return;
    }
    const title = examTitle.trim();
    const saveExam = () => {
      addExam({ courseId, title, dateIso: examDate, difficulty });
      setExamTitle('Examen parcial');
      setCalendarVisible(false);
      onExamAdded(title);
    };
    const duplicate = workspace.exams.some((exam) => exam.courseId === courseId
      && exam.dateIso === examDate
      && exam.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase());
    if (duplicate) {
      Alert.alert('Evaluación repetida', 'Ya existe una evaluación con el mismo nombre, curso y fecha. ¿Quieres crearla de todos modos?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear de todos modos', onPress: saveExam },
      ]);
      return;
    }
    saveExam();
  };

  const addNewTopic = () => {
    if (!courseId || !topicName.trim()) {
      Alert.alert('Revisa el tema', 'Escribe un tema y elige un curso.');
      return;
    }
    const name = topicName.trim();
    const saveTopic = () => {
      addTopic({ courseId, name, priority: difficulty });
      setTopicName('');
      Alert.alert('Tema añadido', `${name} ya está disponible para que KODA lo priorice.`);
    };
    const duplicate = workspace.topics.some((topic) => topic.courseId === courseId && topic.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase());
    if (duplicate) {
      Alert.alert('Tema repetido', 'Ese tema ya está en este curso. ¿Quieres conservar otra copia?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Añadir de todos modos', onPress: saveTopic },
      ]);
      return;
    }
    saveTopic();
  };

  const addNewSlot = () => {
    const durationMinutes = Number(slotMinutes);
    if (!/^\d{2}:\d{2}$/.test(slotTime) || !Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 180) {
      Alert.alert('Revisa el bloque', 'Usa una hora como 18:30 y una duración entre 15 y 180 minutos.');
      return;
    }
    const saveSlot = () => {
      updateAvailability([
        ...workspace.availability,
        { id: `slot-${Date.now()}`, day: slotDay, startsAt: slotTime, durationMinutes },
      ]);
      Alert.alert('Bloque reservado', `${slotDay} · ${slotTime} · ${durationMinutes} min ya está disponible para tu plan.`);
    };
    const duplicate = workspace.availability.some((block) => block.day === slotDay
      && block.startsAt === slotTime
      && block.durationMinutes === durationMinutes);
    if (duplicate) {
      Alert.alert('Bloque repetido', 'Ya tienes este bloque de estudio. ¿Quieres crear otro igual?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear de todos modos', onPress: saveSlot },
      ]);
      return;
    }
    saveSlot();
  };

  const removeSlot = (slotId: string) => {
    updateAvailability(workspace.availability.filter((slot) => slot.id !== slotId));
  };

  const askToRemoveExam = (examId: string) => {
    const exam = workspace.exams.find((item) => item.id === examId);
    if (!exam) return;
    Alert.alert(
      '¿Eliminar este examen?',
      `${exam.title} dejará de influir en tu plan de estudio.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            removeExam(examId);
            Alert.alert('Evaluación eliminada', 'KODA reajustó el plan.');
          },
        },
      ],
    );
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
                <Pressable
                  accessibilityLabel="Seleccionar fecha del examen"
                  accessibilityRole="button"
                  onPress={() => setCalendarVisible((visible) => !visible)}
                  style={({ pressed }) => [styles.datePicker, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }, pressed && styles.pressed]}>
                  <View style={styles.datePickerCopy}>
                    <Text style={[styles.datePickerLabel, { color: theme.textTertiary }]}>FECHA DEL EXAMEN</Text>
                    <Text style={[styles.datePickerValue, { color: theme.text }]}>{formatExamDate(examDate)}</Text>
                  </View>
                  <Ionicons color={theme.accent} name="calendar-outline" size={21} />
                </Pressable>
                {isCalendarVisible ? <MiniCalendar onChange={(dateIso) => {
                  setExamDate(dateIso);
                  setCalendarVisible(false);
                }} value={examDate} /> : null}
                <DifficultyPicker difficulty={difficulty} onChange={setDifficulty} />
                <KodaButton icon="calendar-outline" label="Agregar examen" onPress={addNewExam} />

                <SectionLabel label="EXÁMENES PRÓXIMOS" color={theme.textSecondary} />
                {upcomingExams.length ? (
                  <View style={styles.examList}>
                    {upcomingExams.map((exam) => {
                      const examCourse = workspace.courses.find((course) => course.id === exam.courseId);
                      return (
                        <View key={exam.id} style={[styles.examRow, { borderColor: theme.border }]}>
                          <View style={styles.examRowCopy}>
                            <Text numberOfLines={1} style={[styles.examRowTitle, { color: theme.text }]}>{exam.title}</Text>
                            <Text numberOfLines={1} style={[styles.examRowMeta, { color: theme.textSecondary }]}>{examCourse?.name ?? 'Curso sin asignar'} · {formatExamDate(exam.dateIso)}</Text>
                          </View>
                          <KodaIconButton icon="trash-outline" label={`Eliminar ${exam.title}`} onPress={() => askToRemoveExam(exam.id)} />
                        </View>
                      );
                    })}
                  </View>
                ) : <Text style={[styles.emptyExams, { color: theme.textTertiary }]}>Aún no añadiste evaluaciones.</Text>}

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
  datePicker: { alignItems: 'center', borderRadius: KodaRadius.md, borderWidth: 1, flexDirection: 'row', gap: KodaSpacing.md, minHeight: 58, paddingHorizontal: KodaSpacing.md },
  datePickerCopy: { flex: 1, gap: 2 },
  datePickerLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  datePickerValue: { fontSize: 15, fontWeight: '800', textTransform: 'capitalize' },
  slotInputs: { flexDirection: 'row', gap: KodaSpacing.sm },
  timeInput: { flex: 1.2 },
  minutesInput: { flex: 0.8 },
  notice: { alignItems: 'flex-start', borderRadius: KodaRadius.md, flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.md },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  slotList: { gap: KodaSpacing.xs },
  slotRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: KodaSpacing.sm, paddingVertical: KodaSpacing.sm },
  slotText: { flex: 1, fontSize: 13, fontWeight: '700' },
  examList: { gap: KodaSpacing.xs },
  examRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: KodaSpacing.sm, paddingBottom: KodaSpacing.sm },
  examRowCopy: { flex: 1, gap: 2 },
  examRowTitle: { fontSize: 13, fontWeight: '900' },
  examRowMeta: { fontSize: 11, fontWeight: '600' },
  emptyExams: { fontSize: 12, fontWeight: '600' },
  difficultyHint: { alignSelf: 'center', fontSize: 12, fontWeight: '600' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
