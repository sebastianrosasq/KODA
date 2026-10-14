import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { KodaReveal } from '@/components/koda-reveal';
import {
  KodaAvatar,
  KodaButton,
  KodaCard,
  KodaIconButton,
  KodaPageHeader,
  KodaProgressBar,
  KodaScreen,
  KodaSectionTitle,
  KodaText,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { getCatalogProgram } from '@/data/academic-catalog';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function HomeScreen() {
  const { theme } = useKodaTheme();
  const { completeSession, dashboard, plan, workspace } = useKodaData();
  const todaySessions = plan.filter((session) => session.day === 'Hoy');
  const hasExam = Boolean(dashboard.nextExam);
  const hasAvailability = workspace.availability.length > 0;
  const nextExam = dashboard.nextExam ?? {
    course: 'Añade tu primer examen',
    topic: 'KODA organizará los temas y bloques que necesites.',
    dateLabel: 'Sin fecha',
    remaining: '—',
    preparation: 0,
  };
  const { courseProgress } = dashboard;
  const termLabel = getCatalogProgram(workspace.profile.institutionSlug, workspace.profile.programSlug)?.termLabel ?? 'Ciclo';
  const homeSubtitle = todaySessions.length
    ? 'Hoy tienes bloques listos para avanzar sin saturarte.'
    : !hasAvailability
      ? 'Registra tus horas disponibles para que KODA organice una semana que sí puedas cumplir.'
      : !hasExam
        ? 'Añade tu primer examen para que KODA pueda priorizar tus horas de estudio.'
        : 'Aún no tienes bloques para hoy. Revisa tu plan y ajusta tu semana si hace falta.';

  const toneColor = {
    plum: theme.accent,
    mint: theme.success,
    amber: theme.warning,
    sky: '#3284A6',
  };

  return (
    <KodaScreen>
      <KodaReveal>
        <View style={styles.topBar}>
          <View style={styles.brandLockup}>
            <Image accessibilityLabel="Logotipo de KODA" source={require('@/assets/images/koda-mark.png')} style={styles.brandMark} />
            <Text style={[styles.brandName, { color: theme.text }]}>KODA</Text>
          </View>
          <KodaIconButton icon="person-outline" label="Abrir perfil" onPress={() => router.push('/profile')} />
        </View>
      </KodaReveal>

      <KodaReveal delay={45}>
        <KodaPageHeader
          eyebrow="Semana de exámenes"
          title={'Hola, ' + workspace.profile.displayName}
          subtitle={homeSubtitle}
        />
      </KodaReveal>

      <KodaReveal delay={90}>
        <KodaCard style={[styles.examCard, { backgroundColor: theme.accent, borderColor: theme.accent }]}>
          <View style={styles.examTopRow}>
          <View style={styles.examCopy}>
            <Text style={[styles.examEyebrow, { color: theme.onAccent }]}>{hasExam ? 'PRÓXIMO EXAMEN' : 'EMPIEZA TU PLAN'}</Text>
            <Text numberOfLines={2} style={[styles.examCourse, { color: theme.onAccent }]}>{nextExam.course}</Text>
            <Text numberOfLines={2} style={[styles.examTopic, { color: theme.onAccent }]}>{nextExam.topic}</Text>
          </View>
          <Pressable
            accessibilityHint={hasExam ? 'Abre tu plan de estudio' : 'Abre el formulario para añadir tu primer examen'}
            accessibilityLabel={hasExam ? 'Ver plan del próximo examen' : 'Añadir tu primer examen'}
            accessibilityRole="button"
            onPress={() => router.push('/plan')}
            style={({ pressed }) => [styles.daysBadge, { backgroundColor: theme.onAccent }, pressed && styles.pressedBadge]}>
            <Text style={[styles.daysNumber, { color: theme.accent }]}>{hasExam ? nextExam.remaining.split(' ')[0] : '+'}</Text>
            <Text style={[styles.daysLabel, { color: theme.accent }]}>{hasExam ? 'días' : 'examen'}</Text>
          </Pressable>
          </View>

          <View style={styles.examFooter}>
          {hasExam ? (
            <>
              <View style={styles.preparationRow}>
                <Text style={[styles.preparationLabel, { color: theme.onAccent }]}>Preparación</Text>
                <Text style={[styles.preparationValue, { color: theme.onAccent }]}>{nextExam.preparation}%</Text>
              </View>
              <View style={[styles.heroTrack, { backgroundColor: 'rgba(255,255,255,0.28)' }]}>
                <View
                  style={[
                    styles.heroProgress,
                    {
                      backgroundColor: theme.onAccent,
                      width: nextExam.preparation + '%' as `${number}%`,
                    },
                  ]}
                />
              </View>
            </>
          ) : null}
          <KodaButton
            label={hasExam ? 'Ver mi plan' : 'Organizar mi semana'}
            icon="arrow-forward"
            variant="secondary"
            onPress={() => router.push('/plan')}
            style={styles.heroButton}
          />
          </View>
        </KodaCard>
      </KodaReveal>

      <View style={styles.sectionBlock}>
        <Pressable accessibilityLabel="Abrir KODA IA" accessibilityRole="button" onPress={() => router.push('/coach')} style={({ pressed }) => pressed && styles.pressedCoach}>
          <KodaCard style={[styles.coachCard, { backgroundColor: theme.accentSoft, borderColor: theme.accentSoft }]}>
            <View style={[styles.coachIcon, { backgroundColor: theme.surface }]}>
              <Ionicons color={theme.accent} name="sparkles-outline" size={22} />
            </View>
            <View style={styles.coachCopy}>
              <Text style={[styles.coachTitle, { color: theme.text }]}>Pregunta a KODA IA</Text>
              <Text style={[styles.coachText, { color: theme.textSecondary }]}>Respuestas directas para estudiar o resolver una duda de tu material.</Text>
            </View>
            <KodaButton label="Abrir chat" onPress={() => router.push('/coach')} variant="secondary" />
          </KodaCard>
        </Pressable>
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Tu día de hoy" action="Ver plan" onActionPress={() => router.push('/plan')} />
        <View style={styles.sessionList}>
          {todaySessions.length ? todaySessions.map((session) => {
            const completed = session.completed;
            return (
              <KodaCard key={session.id} style={styles.sessionCard}>
                <View style={[styles.courseStripe, { backgroundColor: toneColor[session.tone] }]} />
                <View style={styles.sessionTime}>
                  <Text style={[styles.timeLabel, { color: theme.text }]}>{session.startsAt}</Text>
                  <Text style={[styles.durationLabel, { color: theme.textTertiary }]}>{session.durationMinutes} min</Text>
                </View>
                <View style={styles.sessionCopy}>
                  <Text numberOfLines={1} style={[styles.sessionTitle, { color: theme.text }]}>
                    {session.title}
                  </Text>
                  <Text numberOfLines={1} style={[styles.sessionCourse, { color: theme.textSecondary }]}>
                    {session.courseName}
                  </Text>
                </View>
                {completed ? (
                  <View
                    accessibilityLabel="Sesión completada"
                    style={[styles.doneIcon, { backgroundColor: theme.successSoft }]}>
                    <Ionicons color={theme.success} name="checkmark" size={16} />
                  </View>
                ) : (
                  <KodaIconButton
                    icon="checkmark-circle-outline"
                    label={'Completar ' + session.title}
                    onPress={() => completeSession(session.id)}
                    style={styles.playButton}
                  />
                )}
              </KodaCard>
            );
          }) : (
            <KodaCard style={styles.emptySessionCard}>
              <Text style={[styles.emptySessionTitle, { color: theme.text }]}>Aún no hay bloques para hoy</Text>
              <Text style={[styles.emptySessionText, { color: theme.textSecondary }]}>{plan.length ? 'Puedes reservar este día para descansar o ajustar tu plan.' : 'Añade disponibilidad y un examen desde tu plan para que KODA proponga un repaso.'}</Text>
            </KodaCard>
          )}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Tus materias" action="Progreso" onActionPress={() => router.push('/progress')} />
        <View style={styles.courseList}>
          {courseProgress.map((course) => (
            <KodaCard key={course.name} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={[styles.courseDot, { backgroundColor: toneColor[course.tone] }]} />
                <KodaText numberOfLines={1} style={styles.courseName}>
                  {course.name}
                </KodaText>
                <Text style={[styles.coursePercent, { color: theme.textSecondary }]}>{course.completed}%</Text>
              </View>
              <KodaProgressBar color={toneColor[course.tone]} progress={course.completed} />
            </KodaCard>
          ))}
        </View>
      </View>

      <View style={styles.miniProfile}>
          <KodaAvatar imageUri={workspace.profile.avatarUrl} initials={workspace.profile.displayName.slice(0, 2).toUpperCase()} />
        <View style={styles.miniProfileCopy}>
          <KodaText style={styles.miniProfileTitle}>{workspace.profile.institutionName}</KodaText>
          <KodaText tone="secondary" style={styles.miniProfileSubtitle}>
            {workspace.profile.programName + ' · ' + workspace.profile.currentTerm + '.° ' + termLabel.toLocaleLowerCase()}
          </KodaText>
        </View>
      </View>
    </KodaScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.sm,
  },
  brandMark: { height: 32, width: 32 },
  brandName: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  coachCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, minHeight: 86, padding: KodaSpacing.lg },
  coachIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 46, justifyContent: 'center', width: 46 },
  coachCopy: { flex: 1, gap: 2, minWidth: 0 },
  coachTitle: { fontSize: 15, fontWeight: '900' },
  coachText: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  examCard: {
    gap: KodaSpacing.xl,
    overflow: 'hidden',
    padding: KodaSpacing.xl,
  },
  examTopRow: {
    flexDirection: 'row',
    gap: KodaSpacing.md,
    justifyContent: 'space-between',
  },
  examCopy: {
    flex: 1,
    gap: KodaSpacing.xs,
    minWidth: 0,
  },
  examEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  examCourse: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 29,
  },
  examTopic: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    opacity: 0.82,
  },
  daysBadge: {
    alignItems: 'center',
    borderRadius: KodaRadius.md,
    height: 66,
    justifyContent: 'center',
    width: 66,
  },
  pressedBadge: { opacity: 0.86, transform: [{ scale: 0.96 }] },
  pressedCoach: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  daysNumber: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 25,
  },
  daysLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  examFooter: {
    gap: KodaSpacing.md,
  },
  preparationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  preparationLabel: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.88,
  },
  preparationValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  heroTrack: {
    borderRadius: KodaRadius.pill,
    height: 7,
    overflow: 'hidden',
  },
  heroProgress: {
    borderRadius: KodaRadius.pill,
    height: '100%',
  },
  heroButton: {
    marginTop: KodaSpacing.sm,
  },
  sectionBlock: {
    gap: KodaSpacing.md,
  },
  sessionList: {
    gap: KodaSpacing.sm,
  },
  emptySessionCard: {
    gap: KodaSpacing.xs,
    padding: KodaSpacing.lg,
  },
  emptySessionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptySessionText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  sessionCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    minHeight: 82,
    overflow: 'hidden',
    paddingHorizontal: KodaSpacing.lg,
    paddingVertical: KodaSpacing.md,
  },
  courseStripe: {
    borderRadius: KodaRadius.pill,
    height: 32,
    width: 4,
  },
  sessionTime: {
    gap: 2,
    width: 42,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '900',
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  sessionCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sessionCourse: {
    fontSize: 12,
    fontWeight: '600',
  },
  doneIcon: {
    alignItems: 'center',
    borderRadius: KodaRadius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  playButton: {
    height: 34,
    width: 34,
  },
  courseList: {
    gap: KodaSpacing.sm,
  },
  courseCard: {
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  courseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.sm,
  },
  courseDot: {
    borderRadius: KodaRadius.pill,
    height: 8,
    width: 8,
  },
  courseName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    minWidth: 0,
  },
  coursePercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  miniProfile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    marginTop: -KodaSpacing.sm,
  },
  miniProfileCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  miniProfileTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  miniProfileSubtitle: {
    fontSize: 12,
  },
});
