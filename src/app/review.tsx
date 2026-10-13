import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import {
  KodaButton,
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
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';
import type { CourseTone } from '@/types/koda-domain';

export default function ReviewScreen() {
  const { theme } = useKodaTheme();
  const { workspace, addFlashcard, reviewFlashcard } = useKodaData();
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardOffset, setCardOffset] = useState(0);
  const [isCreateVisible, setCreateVisible] = useState(false);
  const pendingCards = useMemo(
    () => workspace.flashcards.slice().sort((left, right) => left.mastery - right.mastery),
    [workspace.flashcards],
  );
  const card = pendingCards.length ? pendingCards[cardOffset % pendingCards.length] : null;
  const masteryPoints = workspace.flashcards.reduce((sum, item) => sum + item.mastery, 0);
  const masteryPercent = workspace.flashcards.length ? Math.round((masteryPoints / (workspace.flashcards.length * 3)) * 100) : 0;
  const courseById = new Map(workspace.courses.map((course) => [course.id, course]));
  const decks = workspace.courses
    .filter((course) => course.isActive)
    .map((course) => {
      const cards = workspace.flashcards.filter((item) => item.courseId === course.id);
      return { course, cards, due: cards.filter((item) => item.mastery < 3).length };
    });

  const reviewCard = (remembered: boolean) => {
    if (!card) return;
    reviewFlashcard(card.id, remembered);
    setShowAnswer(false);
    setCardOffset((value) => value + 1);
  };

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="Repaso activo"
        title="Haz que se te quede"
        subtitle="Recuperar una idea es más útil que releerla. Tus tarjetas también se sincronizan con tu cuenta."
        right={<KodaIconButton icon="add" label="Crear flashcard" onPress={() => setCreateVisible(true)} />}
      />

      <KodaCard style={[styles.streakCard, { backgroundColor: theme.surfaceMuted }]}>
        <View style={[styles.streakIcon, { backgroundColor: theme.warningSoft }]}>
          <Ionicons color={theme.warning} name="bulb-outline" size={20} />
        </View>
        <View style={styles.streakCopy}>
          <Text style={[styles.streakValue, { color: theme.text }]}>{pendingCards.filter((item) => item.mastery < 3).length} tarjetas por reforzar</Text>
          <Text style={[styles.streakText, { color: theme.textSecondary }]}>Una respuesta honesta hace que la siguiente sesión sea mejor.</Text>
        </View>
      </KodaCard>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Una tarjeta para empezar" action="Crear" onActionPress={() => setCreateVisible(true)} />
        {card ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mostrar respuesta de la tarjeta"
              onPress={() => setShowAnswer((current) => !current)}
              style={({ pressed }) => pressed && styles.pressed}>
              <KodaCard style={[styles.flashcard, { backgroundColor: showAnswer ? theme.accentSoft : theme.surface }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.deckChip, { backgroundColor: theme.surfaceMuted }]}>
                    <Text style={[styles.deckChipText, { color: theme.textSecondary }]}>{courseById.get(card.courseId)?.name ?? 'Curso'}</Text>
                  </View>
                  <Text style={[styles.masteryChip, { color: theme.textTertiary }]}>Nivel {card.mastery}/3</Text>
                </View>
                <Text style={[styles.flashcardText, { color: theme.text }]}>{showAnswer ? card.answer : card.prompt}</Text>
                <View style={styles.cardHint}>
                  <Ionicons color={theme.textTertiary} name="hand-left-outline" size={14} />
                  <Text style={[styles.cardHintText, { color: theme.textTertiary }]}>{showAnswer ? 'Toca para volver a la pregunta' : 'Toca para revelar la respuesta'}</Text>
                </View>
              </KodaCard>
            </Pressable>
            <View style={styles.flashcardActions}>
              <KodaButton label="Aún no" icon="refresh-outline" variant="secondary" onPress={() => reviewCard(false)} style={styles.actionButton} />
              <KodaButton label="La sé" icon="checkmark" onPress={() => reviewCard(true)} style={styles.actionButton} />
            </View>
          </>
        ) : (
          <KodaCard style={styles.emptyCard}>
            <Ionicons color={theme.textTertiary} name="layers-outline" size={23} />
            <View style={styles.emptyCopy}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Tu primer mazo empieza aquí</Text>
              <KodaText tone="secondary">Crea una pregunta breve con una respuesta clara para cada idea importante.</KodaText>
            </View>
            <KodaButton label="Crear" onPress={() => setCreateVisible(true)} />
          </KodaCard>
        )}
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Tus mazos" />
        <View style={styles.deckList}>
          {decks.map(({ course, cards, due }) => (
            <KodaCard key={course.id} style={styles.deckCard}>
              <View style={[styles.deckIcon, { backgroundColor: toneColor(course.tone, theme) }]}>
                <Ionicons color={theme.onAccent} name="layers-outline" size={18} />
              </View>
              <View style={styles.deckCopy}>
                <Text style={[styles.deckName, { color: theme.text }]}>{course.name}</Text>
                <Text style={[styles.deckDetail, { color: theme.textSecondary }]}>{due} pendientes · {cards.length} tarjetas</Text>
              </View>
            </KodaCard>
          ))}
        </View>
      </View>

      <KodaCard style={styles.masteryCard}>
        <View style={styles.masteryHeader}>
          <View>
            <Text style={[styles.masteryTitle, { color: theme.text }]}>Dominio de tus tarjetas</Text>
            <Text style={[styles.masteryDetail, { color: theme.textSecondary }]}>{masteryPoints} de {workspace.flashcards.length * 3} puntos de recuerdo</Text>
          </View>
          <Text style={[styles.masteryPercent, { color: theme.accent }]}>{masteryPercent}%</Text>
        </View>
        <KodaProgressBar color={theme.accent} progress={masteryPercent} />
      </KodaCard>

      <KodaCard style={[styles.materialsCard, { backgroundColor: theme.surfaceMuted }]}>
        <View style={[styles.materialsIcon, { backgroundColor: theme.accentSoft }]}>
          <Ionicons color={theme.accent} name="document-text-outline" size={20} />
        </View>
        <View style={styles.materialsCopy}>
          <Text style={[styles.materialsTitle, { color: theme.text }]}>Convierte tus apuntes en práctica</Text>
          <Text style={[styles.materialsDetail, { color: theme.textSecondary }]}>Sube un PDF o audio privado para obtener un resumen, tarjetas y un simulacro revisable.</Text>
        </View>
        <KodaButton icon="sparkles-outline" label="Materiales" onPress={() => router.push('/materials')} variant="secondary" />
      </KodaCard>

      {isCreateVisible ? <FlashcardModal onClose={() => setCreateVisible(false)} onCreate={addFlashcard} /> : null}
    </KodaScreen>
  );
}

function FlashcardModal({ onClose, onCreate }: { onClose: () => void; onCreate: (card: { courseId: string; prompt: string; answer: string }) => void }) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const { workspace } = useKodaData();
  const availableCourses = workspace.courses.filter((course) => course.isActive);
  const [courseId, setCourseId] = useState(availableCourses[0]?.id ?? '');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');

  const submit = () => {
    if (!courseId || !prompt.trim() || !answer.trim()) return;
    onCreate({ courseId, prompt, answer });
    onClose();
  };

  return (
    <Modal animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={onClose} transparent visible>
      <Pressable accessibilityLabel="Cerrar creación de flashcard" onPress={onClose} style={[styles.modalOverlay, { backgroundColor: theme.overlay + '99' }]}>
        <Pressable onPress={() => undefined} style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva flashcard</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Una pregunta concreta, una respuesta que puedas recuperar sin pistas.</Text>
              </View>
              <KodaIconButton icon="close" label="Cerrar" onPress={onClose} />
            </View>
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>CURSO</Text>
            <View style={styles.pills}>
              {availableCourses.map((course) => <KodaPill key={course.id} label={course.name} selected={course.id === courseId} onPress={() => setCourseId(course.id)} />)}
            </View>
            <TextInput
              accessibilityLabel="Pregunta de la flashcard"
              multiline
              onChangeText={setPrompt}
              placeholder="Pregunta o concepto"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              value={prompt}
            />
            <TextInput
              accessibilityLabel="Respuesta de la flashcard"
              multiline
              onChangeText={setAnswer}
              placeholder="Respuesta breve y precisa"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, styles.answerInput, { borderColor: theme.border, color: theme.text }]}
              value={answer}
            />
            <KodaButton disabled={!courseId || !prompt.trim() || !answer.trim()} icon="add" label="Guardar tarjeta" onPress={submit} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function toneColor(tone: CourseTone, theme: ReturnType<typeof useKodaTheme>['theme']) {
  return { plum: theme.accent, mint: theme.success, amber: theme.warning, sky: '#3284A6' }[tone];
}

const styles = StyleSheet.create({
  streakCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  streakIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 42, justifyContent: 'center', width: 42 },
  streakCopy: { flex: 1, gap: 2 },
  streakValue: { fontSize: 15, fontWeight: '900' },
  streakText: { fontSize: 13, fontWeight: '600' },
  sectionBlock: { gap: KodaSpacing.md },
  flashcard: { gap: KodaSpacing.xl, justifyContent: 'space-between', minHeight: 270, padding: KodaSpacing.xl },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  deckChip: { borderRadius: KodaRadius.pill, flexShrink: 1, paddingHorizontal: 10, paddingVertical: 6 },
  deckChipText: { fontSize: 11, fontWeight: '900' },
  masteryChip: { fontSize: 11, fontWeight: '800' },
  flashcardText: { fontSize: 23, fontWeight: '800', letterSpacing: -0.5, lineHeight: 31 },
  cardHint: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  cardHintText: { fontSize: 12, fontWeight: '700' },
  flashcardActions: { flexDirection: 'row', gap: KodaSpacing.md },
  actionButton: { flex: 1 },
  emptyCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  emptyCopy: { flex: 1, gap: 4 },
  emptyTitle: { fontSize: 14, fontWeight: '900' },
  deckList: { gap: KodaSpacing.sm },
  deckCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  deckIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 40, justifyContent: 'center', width: 40 },
  deckCopy: { flex: 1, gap: 2 },
  deckName: { fontSize: 14, fontWeight: '900' },
  deckDetail: { fontSize: 12, fontWeight: '600' },
  masteryCard: { gap: KodaSpacing.md, padding: KodaSpacing.lg },
  masteryHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  masteryTitle: { fontSize: 15, fontWeight: '900' },
  masteryDetail: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  masteryPercent: { fontSize: 22, fontWeight: '900', letterSpacing: -0.6 },
  materialsCard: { gap: KodaSpacing.md, padding: KodaSpacing.lg },
  materialsIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 40, justifyContent: 'center', width: 40 },
  materialsCopy: { gap: 3 },
  materialsTitle: { fontSize: 14, fontWeight: '900' },
  materialsDetail: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  modalOverlay: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', padding: KodaSpacing.md },
  modalCard: { borderRadius: KodaRadius.lg, borderWidth: 1, maxHeight: '90%', maxWidth: 560, padding: KodaSpacing.xl, width: '100%' },
  modalContent: { gap: KodaSpacing.lg },
  modalHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.md, justifyContent: 'space-between' },
  modalHeaderCopy: { flex: 1 },
  modalTitle: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5 },
  modalSubtitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 3 },
  modalLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: KodaSpacing.sm },
  input: { borderRadius: KodaRadius.md, borderWidth: 1, fontSize: 15, fontWeight: '600', minHeight: 74, padding: KodaSpacing.md, textAlignVertical: 'top' },
  answerInput: { minHeight: 108 },
});
