import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KodaReveal } from '@/components/koda-reveal';
import {
  KodaCard,
  KodaIconButton,
  KodaPageHeader,
  KodaProgressBar,
  KodaScreen,
  KodaSectionTitle,
  KodaText,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { PlanEditorModal } from '@/features/planner/plan-editor-modal';
import { getDaysUntilExam } from '@/features/planner/generate-study-plan';
import { formatExamDate } from '@/features/planner/mini-calendar';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaFeedback } from '@/providers/koda-feedback-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';
import type { CourseTone, DayLabel } from '@/types/koda-domain';

const dayLabels: Record<number, Exclude<DayLabel, 'Hoy'>> = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };

export default function PlanScreen() {
  const { theme } = useKodaTheme();
  const { confirm, showNotice } = useKodaFeedback();
  const { completeSession, plan, removeExam, workspace } = useKodaData();
  const [selectedDay, setSelectedDay] = useState<DayLabel>('Hoy');
  const [isEditorVisible, setEditorVisible] = useState(false);
  const sessions = plan.filter((session) => session.day === selectedDay);
  const reservedMinutes = workspace.availability.reduce((sum, block) => sum + block.durationMinutes, 0);
  const totalMinutes = plan.length ? plan.reduce((sum, session) => sum + session.durationMinutes, 0) : reservedMinutes;
  const completedSessions = plan.filter((session) => session.completed).length;
  const completion = plan.length ? Math.round((completedSessions / plan.length) * 100) : 0;
  const hasAvailableBlocks = workspace.availability.length > 0;
  const hasAssessment = workspace.exams.some((exam) => exam.kind !== 'activity');
  const hasPendingTopics = workspace.topics.some((topic) => !topic.completed);
  const upcomingExams = useMemo(
    () => workspace.exams
      .filter((exam) => getDaysUntilExam(exam.dateIso) >= 0)
      .slice()
      .sort((left, right) => left.dateIso.localeCompare(right.dateIso)),
    [workspace.exams],
  );
  const pendingTopics = workspace.topics.filter((topic) => !topic.completed).slice(0, 3);
  const weekDays = useMemo(() => getWeekDays(), []);

  const askToRemoveExam = async (examId: string) => {
    const exam = workspace.exams.find((item) => item.id === examId);
    if (!exam) return;
    const accepted = await confirm({
      title: `¿Eliminar ${exam.kind === 'activity' ? 'esta actividad' : 'esta evaluación'}?`,
      message: `${exam.title} dejará de aparecer en tu agenda.`,
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    if (!accepted) return;
    removeExam(examId);
    showNotice({ title: 'Evento eliminado', message: 'Tu agenda y tus sesiones se reajustaron.' });
  };

  return (
    <KodaScreen>
      <KodaReveal>
        <KodaPageHeader
          eyebrow="Plan inteligente"
          title="Tu semana, en orden"
          subtitle="KODA combina tus exámenes, temas pendientes y horas reales disponibles."
          right={<KodaIconButton icon="options-outline" label="Organizar semana" onPress={() => setEditorVisible(true)} />}
        />
      </KodaReveal>

      <KodaReveal delay={45}>
        <KodaCard style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={[styles.summaryKicker, { color: theme.textSecondary }]}>CARGA DE ESTA SEMANA</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>{formatMinutes(totalMinutes)}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: plan.length ? completion >= 50 ? theme.successSoft : theme.warningSoft : hasAvailableBlocks ? theme.accentSoft : theme.warningSoft }]}>
              <Ionicons color={plan.length ? completion >= 50 ? theme.success : theme.warning : hasAvailableBlocks ? theme.accent : theme.warning} name={plan.length && completion >= 50 ? 'checkmark-circle' : hasAvailableBlocks ? 'calendar-outline' : 'time-outline'} size={15} />
              <Text style={[styles.statusPillText, { color: plan.length ? completion >= 50 ? theme.success : theme.warning : hasAvailableBlocks ? theme.accent : theme.warning }]}>
                {plan.length ? completion >= 50 ? 'En ritmo' : 'Por iniciar' : hasAvailableBlocks ? 'Bloques listos' : 'Sin plan'}
              </Text>
            </View>
          </View>
          <KodaProgressBar color={theme.accent} progress={completion} />
          <KodaText tone="secondary" style={styles.summaryDescription}>
            {plan.length
              ? hasAssessment || hasPendingTopics
                ? `${completedSessions} de ${plan.length} bloques completados. KODA ordena la semana por fecha, dificultad y temas pendientes.`
                : `${completedSessions} de ${plan.length} bloques completados. Por ahora son repasos generales: añade una evaluación o un tema para priorizarlos.`
              : hasAvailableBlocks
                ? `${workspace.availability.length} bloques reservados por ${formatMinutes(reservedMinutes)}. Añade un tema o evaluación para que KODA los priorice.`
                : 'Primer paso: reserva una hora real de estudio. Luego añade una evaluación o un tema para que KODA arme sesiones útiles.'}
          </KodaText>
        </KodaCard>
      </KodaReveal>

      <KodaReveal delay={90} style={styles.calendarBlock}>
        <Text style={[styles.calendarLabel, { color: theme.textSecondary }]}>CALENDARIO DE ESTA SEMANA</Text>
        <View style={[styles.weekCalendar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {weekDays.map(({ day, date, weekday }) => {
            const selected = selectedDay === day;
            return (
              <Pressable
                key={`${day}-${date}`}
                accessibilityLabel={`${weekday} ${date}${selected ? ', seleccionado' : ''}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedDay(day)}
                style={({ pressed }) => [styles.calendarDay, selected && { backgroundColor: theme.accent }, pressed && styles.pressed]}>
                <Text style={[styles.calendarWeekday, { color: selected ? theme.onAccent : theme.textTertiary }]}>{day === 'Hoy' ? 'Hoy' : weekday}</Text>
                <Text style={[styles.calendarDate, { color: selected ? theme.onAccent : theme.text }]}>{date}</Text>
              </Pressable>
            );
          })}
        </View>
      </KodaReveal>

      <KodaReveal delay={135} style={styles.sectionBlock}>
        <KodaSectionTitle title={selectedDay === 'Hoy' ? 'Hoy' : `${selectedDay}, esta semana`} action="Organizar" onActionPress={() => setEditorVisible(true)} />
        {sessions.length ? (
          <View style={styles.timeline}>
            {sessions.map((session, index) => (
              <View key={session.id} style={styles.timelineRow}>
                <View style={styles.timelineTime}>
                  <Text style={[styles.time, { color: theme.text }]}>{session.startsAt}</Text>
                  <Text style={[styles.duration, { color: theme.textTertiary }]}>{session.durationMinutes} min</Text>
                </View>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { backgroundColor: getToneColor(session.tone, theme), borderColor: theme.background }]} />
                  {index < sessions.length - 1 ? <View style={[styles.timelineLine, { backgroundColor: theme.border }]} /> : null}
                </View>
                <KodaCard style={[styles.sessionCard, session.completed && { opacity: 0.66 }]}>
                  <View style={styles.sessionTitleRow}>
                    <View style={styles.sessionCopy}>
                      <Text numberOfLines={2} style={[styles.sessionTitle, { color: theme.text }]}>{session.title}</Text>
                      <Text numberOfLines={2} style={[styles.sessionCourse, { color: theme.textSecondary }]}>{session.courseName}</Text>
                    </View>
                    <KodaIconButton
                      icon={session.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      label={session.completed ? `Marcar ${session.title} como pendiente` : `Completar ${session.title}`}
                      onPress={() => completeSession(session.id)}
                    />
                  </View>
                  <View style={[styles.reason, { backgroundColor: theme.surfaceMuted }]}>
                    <Ionicons color={theme.accent} name="sparkles-outline" size={14} />
                    <Text style={[styles.reasonText, { color: theme.textSecondary }]}>{session.rationale}</Text>
                  </View>
                </KodaCard>
              </View>
            ))}
          </View>
        ) : (
          <KodaCard style={styles.emptyCard}>
            <Ionicons color={theme.textTertiary} name="leaf-outline" size={22} />
            <KodaText style={styles.emptyCopy} tone="secondary">{plan.length ? 'No hay bloques para este día. Puedes reservarlo para descansar o añadir uno.' : 'Aún no organizaste tu semana. Añade un examen y tus horas disponibles para crear el primer bloque.'}</KodaText>
          </KodaCard>
        )}
      </KodaReveal>

      <KodaReveal delay={180} style={styles.sectionBlock}>
        <KodaSectionTitle title="Próximas evaluaciones y actividades" action="Añadir" onActionPress={() => setEditorVisible(true)} />
        <Text style={[styles.sectionHint, { color: theme.textTertiary }]}>KODA prioriza las evaluaciones; las actividades quedan visibles en tu agenda.</Text>
        {upcomingExams.length ? upcomingExams.map((exam) => {
          const course = workspace.courses.find((item) => item.id === exam.courseId);
          const daysUntil = getDaysUntilExam(exam.dateIso);
          return (
            <KodaCard key={exam.id} style={styles.examCard}>
              <View style={[styles.examMark, { backgroundColor: course ? getToneColor(course.tone, theme) : theme.accent }]} />
              <View style={styles.examCopy}>
                <Text numberOfLines={2} style={[styles.examTitle, { color: theme.text }]}>{exam.title}</Text>
                <Text numberOfLines={2} style={[styles.examMeta, { color: theme.textSecondary }]}>{exam.kind === 'activity' ? 'Actividad' : 'Evaluación'} · {course?.name ?? 'Curso sin asignar'} · {formatExamDate(exam.dateIso)}</Text>
              </View>
              <View style={styles.examActions}>
                <Text style={[styles.examDays, { color: theme.text }]}>{formatDaysUntil(daysUntil)}</Text>
                <KodaIconButton icon="trash-outline" label={`Eliminar ${exam.title}`} onPress={() => void askToRemoveExam(exam.id)} style={styles.deleteExamButton} />
              </View>
            </KodaCard>
          );
        }) : (
          <KodaCard style={styles.emptyCard}>
            <Ionicons color={theme.textTertiary} name="calendar-outline" size={22} />
            <KodaText style={styles.emptyCopy} tone="secondary">Aún no registras evaluaciones ni actividades. Añade una evaluación para que KODA priorice tus sesiones.</KodaText>
          </KodaCard>
        )}
      </KodaReveal>

      <KodaReveal delay={225} style={styles.sectionBlock}>
        <KodaSectionTitle title="Temas que siguen" action="Añadir" onActionPress={() => setEditorVisible(true)} />
        {pendingTopics.length ? <KodaCard style={styles.topicCard}>
          {pendingTopics.map((topic, index) => {
            const course = workspace.courses.find((item) => item.id === topic.courseId);
            return (
              <View key={topic.id} style={[styles.topicRow, index > 0 && { borderTopColor: theme.border, borderTopWidth: 1 }]}>
                <View style={[styles.topicDot, { backgroundColor: course ? getToneColor(course.tone, theme) : theme.accent }]} />
                <View style={styles.topicCopy}>
                  <Text style={[styles.topicTitle, { color: theme.text }]}>{topic.name}</Text>
                  <Text style={[styles.topicMeta, { color: theme.textTertiary }]}>{course?.name}</Text>
                </View>
                <Text style={[styles.topicPriority, { color: theme.textSecondary }]}>P{topic.priority}</Text>
              </View>
            );
          })}
        </KodaCard> : (
          <KodaCard style={styles.emptyCard}>
            <Ionicons color={theme.textTertiary} name="list-outline" size={22} />
            <KodaText style={styles.emptyCopy} tone="secondary">Añade un tema pendiente para que KODA lo distribuya antes de tu examen.</KodaText>
          </KodaCard>
        )}
      </KodaReveal>

      {isEditorVisible ? <PlanEditorModal onClose={() => setEditorVisible(false)} onExamAdded={(title) => {
        setEditorVisible(false);
        showNotice({ title: 'Evaluación añadida', message: `${title} ya aparece en tus próximas evaluaciones.` });
      }} /> : null}
    </KodaScreen>
  );
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} h ${minutes ? `${minutes} min` : ''}` : `${minutes} min`;
}

function getWeekDays(): { day: DayLabel; date: number; weekday: Exclude<DayLabel, 'Hoy'> }[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, 12);
    const weekday = dayLabels[date.getDay()];
    const day: DayLabel = offset === 0 ? 'Hoy' : weekday;
    return { day, date: date.getDate(), weekday };
  });
}

function formatDaysUntil(days: number) {
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  return `Faltan ${days} d`;
}

function getToneColor(tone: CourseTone, theme: ReturnType<typeof useKodaTheme>['theme']) {
  return { plum: theme.accent, mint: theme.success, amber: theme.warning, sky: '#3284A6' }[tone];
}

const styles = StyleSheet.create({
  summaryCard: { gap: KodaSpacing.lg, padding: KodaSpacing.xl },
  summaryTop: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.sm, justifyContent: 'space-between' },
  summaryKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 0.9 },
  summaryValue: { fontSize: 27, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  statusPill: { alignItems: 'center', borderRadius: KodaRadius.pill, flexDirection: 'row', flexShrink: 0, gap: 5, paddingHorizontal: 10, paddingVertical: 7 },
  statusPillText: { fontSize: 12, fontWeight: '900' },
  summaryDescription: { fontSize: 13 },
  calendarBlock: { gap: KodaSpacing.sm, marginTop: -KodaSpacing.sm },
  calendarLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  weekCalendar: { borderRadius: KodaRadius.md, borderWidth: 1, flexDirection: 'row', padding: KodaSpacing.xs },
  calendarDay: { alignItems: 'center', borderRadius: KodaRadius.sm, flex: 1, gap: 2, minHeight: 58, justifyContent: 'center' },
  calendarWeekday: { fontSize: 9, fontWeight: '900' },
  calendarDate: { fontSize: 16, fontWeight: '900' },
  sectionBlock: { gap: KodaSpacing.md },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', minHeight: 128 },
  timelineTime: { alignItems: 'flex-end', gap: 3, paddingRight: KodaSpacing.md, paddingTop: 10, width: 58 },
  time: { fontSize: 13, fontWeight: '900' },
  duration: { fontSize: 11, fontWeight: '700' },
  timelineRail: { alignItems: 'center', width: 24 },
  timelineDot: { borderRadius: KodaRadius.pill, borderWidth: 3, height: 14, marginTop: 12, width: 14, zIndex: 1 },
  timelineLine: { flex: 1, width: 1 },
  sessionCard: { flex: 1, gap: KodaSpacing.md, marginBottom: KodaSpacing.md, padding: KodaSpacing.lg },
  sessionTitleRow: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm, justifyContent: 'space-between' },
  sessionCopy: { flex: 1, gap: 3, minWidth: 0 },
  sessionTitle: { fontSize: 15, fontWeight: '800' },
  sessionCourse: { fontSize: 13, fontWeight: '600' },
  reason: { alignItems: 'flex-start', borderRadius: KodaRadius.sm, flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.sm },
  reasonText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  emptyCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  emptyCopy: { flex: 1, minWidth: 0 },
  examCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  examMark: { borderRadius: KodaRadius.pill, height: 11, width: 11 },
  examCopy: { flex: 1, gap: 2, minWidth: 0 },
  examTitle: { fontSize: 14, fontWeight: '900' },
  examMeta: { fontSize: 12, fontWeight: '600' },
  examActions: { alignItems: 'flex-end', gap: KodaSpacing.xs },
  examDays: { fontSize: 11, fontWeight: '900', textAlign: 'right' },
  deleteExamButton: { height: 34, width: 34 },
  sectionHint: { fontSize: 12, fontWeight: '600', lineHeight: 17, marginTop: -KodaSpacing.sm },
  topicCard: { padding: KodaSpacing.md },
  topicRow: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm, paddingVertical: KodaSpacing.sm },
  topicDot: { borderRadius: KodaRadius.pill, height: 8, width: 8 },
  topicCopy: { flex: 1, gap: 2, minWidth: 0 },
  topicTitle: { fontSize: 13, fontWeight: '800' },
  topicMeta: { fontSize: 11, fontWeight: '600' },
  topicPriority: { fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});
