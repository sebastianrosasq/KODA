import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { KodaButton, KodaCard, KodaIconButton, KodaPageHeader, KodaPill, KodaProgressBar, KodaScreen, KodaSectionTitle } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { buildFlashcardQuiz, normalizeGeneratedQuiz, scoreSimulation, type SimulationQuestion, type SimulationResult } from '@/features/assessments/quiz-builder';
import { listQuizAttempts, listStudyDocuments, recordQuizAttempt, type QuizAttempt, type StudyDocument } from '@/features/ai/study-documents';
import { useKodaAuth } from '@/providers/koda-auth-provider';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

type SimulationSource = 'document' | 'flashcards';

export default function SimulationsScreen() {
  const { theme } = useKodaTheme();
  const { status } = useKodaAuth();
  const { workspace } = useKodaData();
  const courses = useMemo(() => workspace.courses.filter((course) => course.isActive), [workspace.courses]);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [courseId, setCourseId] = useState('');
  const [questions, setQuestions] = useState<SimulationQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [source, setSource] = useState<SimulationSource>('flashcards');
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSaving, setSaving] = useState(false);
  const selectedCourseId = courses.some((course) => course.id === courseId) ? courseId : courses[0]?.id ?? '';

  const loadData = useCallback(async () => {
    if (status !== 'signed_in') return;
    try {
      const [nextDocuments, nextAttempts] = await Promise.all([listStudyDocuments(), listQuizAttempts()]);
      setDocuments(nextDocuments);
      setAttempts(nextAttempts);
    } catch (error) {
      console.warn('No se pudieron cargar los simulacros', error);
    }
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => void loadData(), 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const courseCards = useMemo(
    () => workspace.flashcards.filter((card) => card.courseId === selectedCourseId),
    [selectedCourseId, workspace.flashcards],
  );
  const availableDocuments = useMemo(
    () => documents.filter((document) => document.analysis?.quizQuestions.length),
    [documents],
  );
  const currentQuestion = questions[currentIndex];
  const totalAnswered = attempts.reduce((sum, attempt) => sum + attempt.questionCount, 0);
  const totalCorrect = attempts.reduce((sum, attempt) => sum + attempt.correctCount, 0);
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  function resetSimulation(nextQuestions: SimulationQuestion[], nextSource: SimulationSource, nextDocumentId: string | null, courseId: string | null) {
    setQuestions(nextQuestions);
    setAnswers(Array.from({ length: nextQuestions.length }, () => null));
    setCurrentIndex(0);
    setSource(nextSource);
    setActiveDocumentId(nextDocumentId);
    setResult(null);
    if (courseId) setCourseId(courseId);
  }

  function startFromFlashcards() {
    const nextQuestions = buildFlashcardQuiz(courseCards);
    if (!nextQuestions.length) {
      Alert.alert('Faltan tarjetas variadas', 'Crea o guarda al menos dos flashcards con respuestas diferentes para construir un simulacro.');
      return;
    }
    resetSimulation(nextQuestions, 'flashcards', null, selectedCourseId);
  }

  function startFromDocument(document: StudyDocument) {
    const nextQuestions = normalizeGeneratedQuiz(document.analysis?.quizQuestions ?? []);
    if (!nextQuestions.length) {
      Alert.alert('Este análisis no tiene preguntas', 'Elige otro material o genera nuevamente el análisis.');
      return;
    }
    resetSimulation(nextQuestions, 'document', document.id, document.courseId);
  }

  function selectAnswer(optionIndex: number) {
    if (result) return;
    setAnswers((current) => current.map((answer, index) => index === currentIndex ? optionIndex : answer));
  }

  async function completeSimulation() {
    if (answers.some((answer) => answer === null)) return;
    const nextResult = scoreSimulation(questions, answers);
    setResult(nextResult);
    if (status !== 'signed_in') return;

    try {
      setSaving(true);
      await recordQuizAttempt({
        courseId: selectedCourseId || null,
        documentId: activeDocumentId,
        source,
        questionCount: questions.length,
        correctCount: nextResult.correctCount,
        incorrectQuestionIndexes: nextResult.incorrectQuestionIndexes,
      });
      await loadData();
    } catch (error) {
      Alert.alert('Resultado no sincronizado', error instanceof Error ? error.message : 'El resultado sigue visible en esta sesión.');
    } finally {
      setSaving(false);
    }
  }

  if (questions.length && currentQuestion && !result) {
    const selectedAnswer = answers[currentIndex];
    const isFinalQuestion = currentIndex === questions.length - 1;
    return (
      <KodaScreen>
        <KodaPageHeader
          eyebrow={source === 'document' ? 'Simulacro desde PDF' : 'Simulacro desde tarjetas'}
          title="Concéntrate en recuperar"
          subtitle={`Pregunta ${currentIndex + 1} de ${questions.length}. Responde todas antes de ver el resultado.`}
          right={<KodaIconButton icon="close" label="Salir del simulacro" onPress={() => resetSimulation([], 'flashcards', null, null)} />}
        />
        <KodaProgressBar color={theme.accent} height={10} progress={((currentIndex + 1) / questions.length) * 100} />
        <KodaCard style={styles.questionCard}>
          <Text style={[styles.questionLabel, { color: theme.accent }]}>PREGUNTA {currentIndex + 1}</Text>
          <Text style={[styles.questionText, { color: theme.text }]}>{currentQuestion.question}</Text>
        </KodaCard>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {currentQuestion.options.map((option, index) => {
            const selected = selectedAnswer === index;
            return (
              <Pressable
                accessibilityLabel={`Opción ${index + 1}: ${option}`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={`${currentQuestion.id}-${option}`}
                onPress={() => selectAnswer(index)}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: selected ? theme.accentSoft : theme.surface, borderColor: selected ? theme.accent : theme.border },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.optionMarker, { borderColor: selected ? theme.accent : theme.textTertiary, backgroundColor: selected ? theme.accent : 'transparent' }]}>
                  {selected ? <Ionicons color={theme.onAccent} name="checkmark" size={13} /> : null}
                </View>
                <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.navigationButtons}>
          <KodaButton disabled={currentIndex === 0} icon="arrow-back" label="Anterior" onPress={() => setCurrentIndex((value) => Math.max(0, value - 1))} style={styles.navigationButton} variant="secondary" />
          {isFinalQuestion ? (
            <KodaButton disabled={selectedAnswer === null || isSaving} icon="checkmark-circle-outline" label={isSaving ? 'Guardando…' : 'Finalizar'} onPress={() => void completeSimulation()} style={styles.navigationButton} />
          ) : (
            <KodaButton disabled={selectedAnswer === null} icon="arrow-forward" label="Siguiente" onPress={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))} style={styles.navigationButton} />
          )}
        </View>
      </KodaScreen>
    );
  }

  if (result) {
    const missedQuestions = result.incorrectQuestionIndexes.map((index) => questions[index]).filter(Boolean);
    return (
      <KodaScreen>
        <KodaPageHeader
          eyebrow="Resultado del simulacro"
          title={result.percentage >= 80 ? 'Muy buen dominio' : result.percentage >= 60 ? 'Vas encaminado' : 'Hay espacio para reforzar'}
          subtitle={`${result.correctCount} de ${questions.length} respuestas correctas. Este resultado te sirve para decidir qué repasar después.`}
          right={<KodaIconButton icon="close" label="Cerrar resultado" onPress={() => resetSimulation([], 'flashcards', null, null)} />}
        />
        <KodaCard style={[styles.resultCard, { backgroundColor: result.percentage >= 80 ? theme.successSoft : theme.warningSoft }]}>
          <Text accessibilityLabel={`Resultado ${result.percentage} por ciento`} style={[styles.resultPercent, { color: result.percentage >= 80 ? theme.success : theme.warning }]}>{result.percentage}%</Text>
          <Text style={[styles.resultCaption, { color: theme.text }]}>Tu precisión en este intento</Text>
          <KodaProgressBar color={result.percentage >= 80 ? theme.success : theme.warning} height={10} progress={result.percentage} />
        </KodaCard>
        {missedQuestions.length ? (
          <View style={styles.sectionBlock}>
            <KodaSectionTitle title="Refuerza estas ideas" />
            {missedQuestions.map((question) => (
              <KodaCard key={question.id} style={styles.feedbackCard}>
                <Text style={[styles.feedbackQuestion, { color: theme.text }]}>{question.question}</Text>
                <Text style={[styles.feedbackAnswer, { color: theme.success }]}>Respuesta: {question.options[question.correctOption]}</Text>
                <Text style={[styles.feedbackExplanation, { color: theme.textSecondary }]}>{question.explanation}</Text>
              </KodaCard>
            ))}
          </View>
        ) : null}
        <View style={styles.resultActions}>
          <KodaButton icon="refresh-outline" label="Otro simulacro" onPress={() => resetSimulation([], 'flashcards', null, null)} variant="secondary" style={styles.navigationButton} />
          <KodaButton icon="layers-outline" label="Repasar tarjetas" onPress={() => router.push('/review')} style={styles.navigationButton} />
        </View>
      </KodaScreen>
    );
  }

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="Evaluación activa"
        title="Mide lo que puedes recuperar"
        subtitle="Elige preguntas creadas desde tus tarjetas o desde un PDF que ya analizaste."
        right={<KodaIconButton icon="chevron-back" label="Volver al repaso" onPress={() => router.back()} />}
      />

      <KodaCard style={[styles.analyticsHero, { backgroundColor: theme.surfaceMuted }]}>
        <View>
          <Text style={[styles.analyticsValue, { color: theme.text }]}>{accuracy}%</Text>
          <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>precisión acumulada</Text>
        </View>
        <View style={styles.analyticsDivider} />
        <View>
          <Text style={[styles.analyticsSmallValue, { color: theme.text }]}>{attempts.length}</Text>
          <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>simulacros</Text>
        </View>
        <View>
          <Text style={[styles.analyticsSmallValue, { color: theme.text }]}>{totalAnswered}</Text>
          <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>respuestas</Text>
        </View>
      </KodaCard>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Desde tus flashcards" />
        <View style={styles.pills}>
          {courses.map((course) => <KodaPill key={course.id} label={course.name} selected={course.id === selectedCourseId} onPress={() => setCourseId(course.id)} />)}
        </View>
        <KodaCard style={styles.sourceCard}>
          <View style={[styles.sourceIcon, { backgroundColor: theme.accentSoft }]}>
            <Ionicons color={theme.accent} name="layers-outline" size={20} />
          </View>
          <View style={styles.sourceCopy}>
            <Text style={[styles.sourceTitle, { color: theme.text }]}>{courseCards.length} tarjetas disponibles</Text>
            <Text style={[styles.sourceDetail, { color: theme.textSecondary }]}>KODA mezcla respuestas de tu propio mazo; no inventa distractores.</Text>
          </View>
          <KodaButton disabled={!courseCards.length} icon="play" label="Practicar" onPress={startFromFlashcards} />
        </KodaCard>
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Desde un material analizado" action="Materiales" onActionPress={() => router.push('/materials')} />
        {availableDocuments.length ? availableDocuments.map((document) => (
          <KodaCard key={document.id} style={styles.sourceCard}>
            <View style={[styles.sourceIcon, { backgroundColor: theme.successSoft }]}>
              <Ionicons color={theme.success} name="document-text-outline" size={20} />
            </View>
            <View style={styles.sourceCopy}>
              <Text numberOfLines={1} style={[styles.sourceTitle, { color: theme.text }]}>{document.analysis?.title ?? document.originalFilename}</Text>
              <Text style={[styles.sourceDetail, { color: theme.textSecondary }]}>{document.analysis?.quizQuestions.length ?? 0} preguntas de práctica generadas</Text>
            </View>
            <KodaButton icon="play" label="Usar" onPress={() => startFromDocument(document)} />
          </KodaCard>
        )) : (
          <KodaCard style={styles.emptyCard}>
            <Ionicons color={theme.textTertiary} name="document-attach-outline" size={23} />
            <View style={styles.emptyCopy}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Aún no hay simulacros desde PDF</Text>
              <Text style={[styles.emptyDetail, { color: theme.textSecondary }]}>Analiza un material propio y revisa las preguntas antes de practicar.</Text>
            </View>
          </KodaCard>
        )}
      </View>
    </KodaScreen>
  );
}

const styles = StyleSheet.create({
  sectionBlock: { gap: KodaSpacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: KodaSpacing.sm },
  questionCard: { gap: KodaSpacing.md, minHeight: 190, justifyContent: 'center', padding: KodaSpacing.xl },
  questionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  questionText: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, lineHeight: 30 },
  options: { gap: KodaSpacing.sm },
  option: { alignItems: 'center', borderRadius: KodaRadius.md, borderWidth: 1, flexDirection: 'row', gap: KodaSpacing.md, minHeight: 60, paddingHorizontal: KodaSpacing.md, paddingVertical: KodaSpacing.sm },
  optionMarker: { alignItems: 'center', borderRadius: KodaRadius.pill, borderWidth: 1.5, height: 24, justifyContent: 'center', width: 24 },
  optionText: { flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  navigationButtons: { flexDirection: 'row', gap: KodaSpacing.md },
  navigationButton: { flex: 1 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  resultCard: { alignItems: 'center', gap: KodaSpacing.sm, padding: KodaSpacing.xl },
  resultPercent: { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  resultCaption: { fontSize: 14, fontWeight: '800', marginBottom: KodaSpacing.sm },
  feedbackCard: { gap: KodaSpacing.sm, padding: KodaSpacing.lg },
  feedbackQuestion: { fontSize: 15, fontWeight: '900', lineHeight: 21 },
  feedbackAnswer: { fontSize: 13, fontWeight: '900', lineHeight: 19 },
  feedbackExplanation: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  resultActions: { flexDirection: 'row', gap: KodaSpacing.md },
  analyticsHero: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, justifyContent: 'space-between', padding: KodaSpacing.lg },
  analyticsValue: { fontSize: 31, fontWeight: '900', letterSpacing: -1 },
  analyticsSmallValue: { fontSize: 19, fontWeight: '900' },
  analyticsLabel: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  analyticsDivider: { alignSelf: 'stretch', backgroundColor: '#A9A6B0', opacity: 0.32, width: 1 },
  sourceCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.md },
  sourceIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 42, justifyContent: 'center', width: 42 },
  sourceCopy: { flex: 1, gap: 3 },
  sourceTitle: { fontSize: 14, fontWeight: '900' },
  sourceDetail: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  emptyCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  emptyCopy: { flex: 1, gap: 2 },
  emptyTitle: { fontSize: 14, fontWeight: '900' },
  emptyDetail: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
});
