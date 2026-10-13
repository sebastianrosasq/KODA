import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { KodaReveal } from '@/components/koda-reveal';
import {
  KodaCard,
  KodaPageHeader,
  KodaProgressBar,
  KodaScreen,
  KodaSectionTitle,
  KodaText,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function ProgressScreen() {
  const { theme } = useKodaTheme();
  const { dashboard } = useKodaData();
  const { courseProgress } = dashboard;
  const averageProgress = courseProgress.length
    ? Math.round(courseProgress.reduce((sum, course) => sum + course.completed, 0) / courseProgress.length)
    : 0;
  const nextExam = dashboard.nextExam;
  const focusCourse = courseProgress.slice().sort((left, right) => left.completed - right.completed)[0];
  const toneColor = {
    plum: theme.accent,
    mint: theme.success,
    amber: theme.warning,
    sky: '#3284A6',
  };

  return (
    <KodaScreen>
      <KodaReveal>
        <KodaPageHeader
          eyebrow="Seguimiento"
          title="Tu avance real"
          subtitle="Mide lo que ya dominaste y encuentra qué necesita atención."
        />
      </KodaReveal>

      <KodaReveal delay={45}>
        <KodaCard style={[styles.scoreCard, { backgroundColor: theme.surfaceMuted }]}>
          <View style={[styles.scoreCircle, { borderColor: theme.accent }]}>
            <Text style={[styles.scoreNumber, { color: theme.text }]}>{averageProgress}</Text>
            <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>nivel</Text>
          </View>
          <View style={styles.scoreCopy}>
            <Text style={[styles.scoreTitle, { color: theme.text }]}>Vas por buen camino</Text>
            <Text style={[styles.scoreText, { color: theme.textSecondary }]}>
              {focusCourse
                ? `Prioriza ${focusCourse.name} para equilibrar tu semana.`
                : 'Añade tus cursos y temas para recibir una recomendación personalizada.'}
            </Text>
          </View>
        </KodaCard>
      </KodaReveal>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Avance por materia" />
        <View style={styles.progressList}>
          {courseProgress.map((course) => (
            <KodaCard key={course.name} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={styles.courseTitleWrap}>
                  <View style={[styles.courseDot, { backgroundColor: toneColor[course.tone] }]} />
                  <KodaText style={styles.courseName}>{course.name}</KodaText>
                </View>
                <Text style={[styles.coursePercent, { color: theme.text }]}>{course.completed + '%'}</Text>
              </View>
              <KodaProgressBar color={toneColor[course.tone]} progress={course.completed} />
              <Text style={[styles.courseCaption, { color: theme.textSecondary }]}>
                {course.completed >= 60 ? 'Ritmo saludable' : 'Siguiente prioridad de repaso'}
              </Text>
            </KodaCard>
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Atención esta semana" />
        <KodaCard style={[styles.alertCard, { backgroundColor: theme.warningSoft, borderColor: theme.warningSoft }]}>
          <View style={[styles.alertIcon, { backgroundColor: theme.surface }]}>
            <Ionicons color={theme.warning} name="time-outline" size={19} />
          </View>
          <View style={styles.alertCopy}>
            <Text style={[styles.alertTitle, { color: theme.text }]}>{nextExam?.course ?? 'Añade tu primer examen'}</Text>
            <Text style={[styles.alertText, { color: theme.textSecondary }]}>
              {nextExam
                ? `${nextExam.remaining} para el examen. Revisa el siguiente tema: ${nextExam.topic}.`
                : 'Cuando registres un examen, KODA destacará aquí el curso que necesita atención.'}
            </Text>
          </View>
        </KodaCard>
      </View>
    </KodaScreen>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.lg,
    padding: KodaSpacing.xl,
  },
  scoreCircle: {
    alignItems: 'center',
    borderRadius: KodaRadius.pill,
    borderWidth: 6,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  scoreNumber: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1.1,
    lineHeight: 33,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  scoreCopy: {
    flex: 1,
    gap: 4,
  },
  scoreTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  sectionBlock: {
    gap: KodaSpacing.md,
  },
  progressList: {
    gap: KodaSpacing.sm,
  },
  courseCard: {
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  courseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseTitleWrap: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: KodaSpacing.sm,
    paddingRight: KodaSpacing.md,
  },
  courseDot: {
    borderRadius: KodaRadius.pill,
    height: 9,
    width: 9,
  },
  courseName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  coursePercent: {
    fontSize: 14,
    fontWeight: '900',
  },
  courseCaption: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  alertIcon: {
    alignItems: 'center',
    borderRadius: KodaRadius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  alertCopy: {
    flex: 1,
    gap: 3,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});
