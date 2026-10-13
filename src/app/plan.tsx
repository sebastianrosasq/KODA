import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { weeklySessions } from '@/data/demo-data';
import {
  KodaButton,
  KodaCard,
  KodaPageHeader,
  KodaPill,
  KodaProgressBar,
  KodaScreen,
  KodaSectionTitle,
  KodaText,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useKodaTheme } from '@/providers/koda-theme-provider';

const days = ['Hoy', 'Mar', 'Mié', 'Jue'];

export default function PlanScreen() {
  const { theme } = useKodaTheme();
  const [selectedDay, setSelectedDay] = useState('Hoy');
  const [wasAdjusted, setWasAdjusted] = useState(false);
  const sessions = weeklySessions[selectedDay] ?? [];

  const toneColor = {
    purple: theme.accent,
    mint: theme.success,
    amber: theme.warning,
  };

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="Plan inteligente"
        title="Tu semana, en orden"
        subtitle="KODA prioriza lo más cercano sin llenar cada minuto."
      />

      <KodaCard style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={[styles.summaryKicker, { color: theme.textSecondary }]}>CARGA DE ESTA SEMANA</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>8 h 10 min</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: theme.successSoft }]}>
            <Ionicons color={theme.success} name="checkmark-circle" size={15} />
            <Text style={[styles.statusPillText, { color: theme.success }]}>Viable</Text>
          </View>
        </View>
        <KodaProgressBar color={theme.accent} progress={68} />
        <KodaText tone="secondary" style={styles.summaryDescription}>
          Ya tienes 5 de 7 sesiones distribuidas. El jueves queda libre después del examen.
        </KodaText>
      </KodaCard>

      <View style={styles.dayPicker}>
        {days.map((day) => (
          <KodaPill key={day} label={day} selected={selectedDay === day} onPress={() => setSelectedDay(day)} />
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title={selectedDay === 'Hoy' ? 'Hoy, lunes' : selectedDay + ', esta semana'} />
        {sessions.length ? (
          <View style={styles.timeline}>
            {sessions.map((session) => (
              <View key={session.id} style={styles.timelineRow}>
                <View style={styles.timelineTime}>
                  <Text style={[styles.time, { color: theme.text }]}>{session.time}</Text>
                  <Text style={[styles.duration, { color: theme.textTertiary }]}>{session.duration}</Text>
                </View>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { backgroundColor: toneColor[session.tone] }]} />
                  <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                </View>
                <KodaCard style={styles.sessionCard}>
                  <View style={styles.sessionTitleRow}>
                    <Text style={[styles.sessionTitle, { color: theme.text }]}>{session.title}</Text>
                    <Ionicons color={toneColor[session.tone]} name="ellipse" size={10} />
                  </View>
                  <Text style={[styles.sessionCourse, { color: theme.textSecondary }]}>{session.course}</Text>
                </KodaCard>
              </View>
            ))}
          </View>
        ) : (
          <KodaCard style={styles.emptyCard}>
            <Ionicons color={theme.textTertiary} name="leaf-outline" size={22} />
            <KodaText tone="secondary">No hay bloques para este día. Puedes conservarlo como descanso.</KodaText>
          </KodaCard>
        )}
      </View>

      <KodaCard style={[styles.tipCard, { backgroundColor: theme.accentSoft, borderColor: theme.accentSoft }]}>
        <Ionicons color={theme.accent} name="sparkles-outline" size={20} />
        <View style={styles.tipCopy}>
          <Text style={[styles.tipTitle, { color: theme.text }]}>Una recomendación simple</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            Empieza por Arquitectura. Está más cerca y todavía puedes ganar confianza con un simulacro corto.
          </Text>
        </View>
      </KodaCard>

      <KodaButton
        label={wasAdjusted ? 'Plan actualizado' : 'Ajustar mi plan'}
        icon={wasAdjusted ? 'checkmark' : 'options-outline'}
        onPress={() => setWasAdjusted(true)}
      />
    </KodaScreen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: KodaSpacing.lg,
    padding: KodaSpacing.xl,
  },
  summaryTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryKicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  summaryValue: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 4,
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: KodaRadius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '900',
  },
  summaryDescription: {
    fontSize: 13,
  },
  dayPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: KodaSpacing.sm,
    marginTop: -KodaSpacing.sm,
  },
  sectionBlock: {
    gap: KodaSpacing.md,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 104,
  },
  timelineTime: {
    alignItems: 'flex-end',
    gap: 3,
    paddingRight: KodaSpacing.md,
    paddingTop: 10,
    width: 58,
  },
  time: {
    fontSize: 13,
    fontWeight: '900',
  },
  duration: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineRail: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    borderColor: '#FFFFFF',
    borderRadius: KodaRadius.pill,
    borderWidth: 3,
    height: 14,
    marginTop: 12,
    width: 14,
    zIndex: 1,
  },
  timelineLine: {
    flex: 1,
    width: 1,
  },
  sessionCard: {
    flex: 1,
    gap: 4,
    marginBottom: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  sessionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.sm,
    justifyContent: 'space-between',
  },
  sessionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  sessionCourse: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  tipCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  tipCopy: {
    flex: 1,
    gap: 3,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  tipText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});
