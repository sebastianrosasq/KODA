import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { KodaReveal } from '@/components/koda-reveal';
import {
  KodaCard,
  KodaIconButton,
  KodaPageHeader,
  KodaPill,
  KodaProgressBar,
  KodaScreen,
  KodaSectionTitle,
  KodaText,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { PlanEditorModal } from '@/features/planner/plan-editor-modal';
import { getDaysUntilExam } from '@/features/planner/generate-study-plan';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';
import type { CourseTone, DayLabel } from '@/types/koda-domain';

const days: DayLabel[] = ['Hoy', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function PlanScreen() {
  const { theme } = useKodaTheme();
  const { completeSession, plan, workspace } = useKodaData();
  const [selectedDay, setSelectedDay] = useState<DayLabel>('Hoy');
  const [isEditorVisible, setEditorVisible] = useState(false);
  const sessions = plan.filter((session) => session.day === selectedDay);
  const totalMinutes = plan.reduce((sum, session) => sum + session.durationMinutes, 0);
  const completedSessions = plan.filter((session) => session.completed).length;
  const completion = plan.length ? Math.round((completedSessions / plan.length) * 100) : 0;
  const upcomingExams = useMemo(
    () => workspace.exams.slice().sort((left, right) => left.dateIso.localeCompare(right.dateIso)),
    [workspace.exams],
  );
  const pendingTopics = workspace.topics.filter((topic) => !topic.completed).slice(0, 3);

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
            <View style={[styles.statusPill, { backgroundColor: completion >= 50 ? theme.successSoft : theme.warningSoft }]}>
              <Ionicons color={completion >= 50 ? theme.success : theme.warning} name={completion >= 50 ? 'checkmark-circle' : 'time-outline'} size={15} />
              <Text style={[styles.statusPillText, { color: completion >= 50 ? theme.success : theme.warning }]}>
                {completion >= 50 ? 'En ritmo' : 'Por iniciar'}
              </Text>
            </View>
          </View>
          <KodaProgressBar color={theme.accent} progress={completion} />
          <KodaText tone="secondary" style={styles.summaryDescription}>
            {completedSessions} de {plan.length} bloques completados. Puedes mover o añadir horas cuando tu semana cambie.
          </KodaText>
        </KodaCard>
      </KodaReveal>

      <KodaReveal delay={90} style={styles.dayPicker}>
        {days.map((day) => <KodaPill key={day} label={day} selected={selectedDay === day} onPress={() => setSelectedDay(day)} />)}
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
                      <Text style={[styles.sessionTitle, { color: theme.text }]}>{session.title}</Text>
                      <Text style={[styles.sessionCourse, { color: theme.textSecondary }]}>{session.courseName}</Text>
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
            <KodaText tone="secondary">No hay bloques para este día. Puedes reservarlo para descansar o añadir uno.</KodaText>
          </KodaCard>
        )}
      </KodaReveal>

      <KodaReveal delay={180} style={styles.sectionBlock}>
        <KodaSectionTitle title="Exámenes próximos" action="Agregar" onActionPress={() => setEditorVisible(true)} />
        {upcomingExams.map((exam) => {
          const course = workspace.courses.find((item) => item.id === exam.courseId);
          const daysUntil = getDaysUntilExam(exam.dateIso);
          return (
            <KodaCard key={exam.id} style={styles.examCard}>
              <View style={[styles.examMark, { backgroundColor: course ? getToneColor(course.tone, theme) : theme.accent }]} />
              <View style={styles.examCopy}>
                <Text style={[styles.examTitle, { color: theme.text }]}>{exam.title}</Text>
                <Text style={[styles.examMeta, { color: theme.textSecondary }]}>{course?.name ?? 'Curso sin asignar'} · {exam.dateIso}</Text>
              </View>
              <Text style={[styles.examDays, { color: theme.text }]}>{daysUntil}d</Text>
            </KodaCard>
          );
        })}
      </KodaReveal>

      <KodaReveal delay={225} style={styles.sectionBlock}>
        <KodaSectionTitle title="Temas que siguen" action="Añadir" onActionPress={() => setEditorVisible(true)} />
        <KodaCard style={styles.topicCard}>
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
        </KodaCard>
      </KodaReveal>

      {isEditorVisible ? <PlanEditorModal onClose={() => setEditorVisible(false)} /> : null}
    </KodaScreen>
  );
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} h ${minutes ? `${minutes} min` : ''}` : `${minutes} min`;
}

function getToneColor(tone: CourseTone, theme: ReturnType<typeof useKodaTheme>['theme']) {
  return { plum: theme.accent, mint: theme.success, amber: theme.warning, sky: '#3284A6' }[tone];
}

const styles = StyleSheet.create({
  summaryCard: { gap: KodaSpacing.lg, padding: KodaSpacing.xl },
  summaryTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  summaryKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 0.9 },
  summaryValue: { fontSize: 27, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  statusPill: { alignItems: 'center', borderRadius: KodaRadius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingVertical: 7 },
  statusPillText: { fontSize: 12, fontWeight: '900' },
  summaryDescription: { fontSize: 13 },
  dayPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: KodaSpacing.sm, marginTop: -KodaSpacing.sm },
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
  sessionCopy: { flex: 1, gap: 3 },
  sessionTitle: { fontSize: 15, fontWeight: '800' },
  sessionCourse: { fontSize: 13, fontWeight: '600' },
  reason: { alignItems: 'flex-start', borderRadius: KodaRadius.sm, flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.sm },
  reasonText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  emptyCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  examCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  examMark: { borderRadius: KodaRadius.pill, height: 11, width: 11 },
  examCopy: { flex: 1, gap: 2 },
  examTitle: { fontSize: 14, fontWeight: '900' },
  examMeta: { fontSize: 12, fontWeight: '600' },
  examDays: { fontSize: 16, fontWeight: '900' },
  topicCard: { padding: KodaSpacing.md },
  topicRow: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm, paddingVertical: KodaSpacing.sm },
  topicDot: { borderRadius: KodaRadius.pill, height: 8, width: 8 },
  topicCopy: { flex: 1, gap: 2 },
  topicTitle: { fontSize: 13, fontWeight: '800' },
  topicMeta: { fontSize: 11, fontWeight: '600' },
  topicPriority: { fontSize: 12, fontWeight: '900' },
});
