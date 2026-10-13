import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { flashcard, reviewDecks } from '@/data/demo-data';
import {
  KodaButton,
  KodaCard,
  KodaPageHeader,
  KodaProgressBar,
  KodaScreen,
  KodaSectionTitle,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function ReviewScreen() {
  const { theme } = useKodaTheme();
  const [showAnswer, setShowAnswer] = useState(false);
  const [mastered, setMastered] = useState(6);

  const toneColor = {
    purple: theme.accent,
    mint: theme.success,
    amber: theme.warning,
  };

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="Repaso activo"
        title="Haz que se te quede"
        subtitle="Recuperar una idea es más útil que releerla."
      />

      <KodaCard style={[styles.streakCard, { backgroundColor: theme.surfaceMuted }]}>
        <View style={[styles.streakIcon, { backgroundColor: theme.warningSoft }]}>
          <Ionicons color={theme.warning} name="flame" size={20} />
        </View>
        <View style={styles.streakCopy}>
          <Text style={[styles.streakValue, { color: theme.text }]}>4 días de racha</Text>
          <Text style={[styles.streakText, { color: theme.textSecondary }]}>Te faltan 12 minutos para mantenerla hoy.</Text>
        </View>
      </KodaCard>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Una tarjeta para empezar" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mostrar respuesta de la tarjeta"
          onPress={() => setShowAnswer((current) => !current)}
          style={({ pressed }) => pressed && styles.pressed}>
          <KodaCard style={[styles.flashcard, { backgroundColor: showAnswer ? theme.accentSoft : theme.surface }]}>
            <View style={styles.cardTop}>
              <View style={[styles.deckChip, { backgroundColor: theme.surfaceMuted }]}>
                <Text style={[styles.deckChipText, { color: theme.textSecondary }]}>{flashcard.deck}</Text>
              </View>
              <Ionicons color={theme.textTertiary} name="sync-outline" size={18} />
            </View>
            <Text style={[styles.flashcardText, { color: theme.text }]}>
              {showAnswer ? flashcard.answer : flashcard.prompt}
            </Text>
            <View style={styles.cardHint}>
              <Ionicons color={theme.textTertiary} name="hand-left-outline" size={14} />
              <Text style={[styles.cardHintText, { color: theme.textTertiary }]}>
                {showAnswer ? 'Toca para ver la pregunta' : 'Toca para revelar la respuesta'}
              </Text>
            </View>
          </KodaCard>
        </Pressable>
        <View style={styles.flashcardActions}>
          <KodaButton
            label="Aún no"
            icon="refresh-outline"
            variant="secondary"
            onPress={() => setShowAnswer(false)}
            style={styles.actionButton}
          />
          <KodaButton
            label="La sé"
            icon="checkmark"
            onPress={() => {
              setMastered((current) => Math.min(18, current + 1));
              setShowAnswer(false);
            }}
            style={styles.actionButton}
          />
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Tus mazos" action="Ver todos" />
        <View style={styles.deckList}>
          {reviewDecks.map((deck) => (
            <KodaCard key={deck.id} style={styles.deckCard}>
              <View style={[styles.deckIcon, { backgroundColor: toneColor[deck.tone] }]}>
                <Ionicons color={theme.onAccent} name="layers-outline" size={18} />
              </View>
              <View style={styles.deckCopy}>
                <Text style={[styles.deckName, { color: theme.text }]}>{deck.name}</Text>
                <Text style={[styles.deckDetail, { color: theme.textSecondary }]}>
                  {deck.due + ' pendientes · ' + deck.cards + ' tarjetas'}
                </Text>
              </View>
              <Ionicons color={theme.textTertiary} name="chevron-forward" size={18} />
            </KodaCard>
          ))}
        </View>
      </View>

      <KodaCard style={styles.masteryCard}>
        <View style={styles.masteryHeader}>
          <View>
            <Text style={[styles.masteryTitle, { color: theme.text }]}>Dominio de hoy</Text>
            <Text style={[styles.masteryDetail, { color: theme.textSecondary }]}>{mastered + ' de 18 tarjetas'}</Text>
          </View>
          <Text style={[styles.masteryPercent, { color: theme.accent }]}>{Math.round((mastered / 18) * 100)}%</Text>
        </View>
        <KodaProgressBar color={theme.accent} progress={(mastered / 18) * 100} />
      </KodaCard>
    </KodaScreen>
  );
}

const styles = StyleSheet.create({
  streakCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  streakIcon: {
    alignItems: 'center',
    borderRadius: KodaRadius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  streakCopy: {
    flex: 1,
    gap: 2,
  },
  streakValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionBlock: {
    gap: KodaSpacing.md,
  },
  flashcard: {
    gap: KodaSpacing.xl,
    minHeight: 270,
    justifyContent: 'space-between',
    padding: KodaSpacing.xl,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deckChip: {
    borderRadius: KodaRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deckChipText: {
    fontSize: 11,
    fontWeight: '900',
  },
  flashcardText: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 31,
  },
  cardHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cardHintText: {
    fontSize: 12,
    fontWeight: '700',
  },
  flashcardActions: {
    flexDirection: 'row',
    gap: KodaSpacing.md,
  },
  actionButton: {
    flex: 1,
  },
  deckList: {
    gap: KodaSpacing.sm,
  },
  deckCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  deckIcon: {
    alignItems: 'center',
    borderRadius: KodaRadius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  deckCopy: {
    flex: 1,
    gap: 2,
  },
  deckName: {
    fontSize: 14,
    fontWeight: '900',
  },
  deckDetail: {
    fontSize: 12,
    fontWeight: '600',
  },
  masteryCard: {
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  masteryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  masteryTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  masteryDetail: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  masteryPercent: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
