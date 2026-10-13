import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  analyzeStudyDocument,
  deleteStudyDocument,
  getAiDocumentConsent,
  listStudyDocuments,
  markDocumentFlashcardsImported,
  recordAiDocumentConsent,
  type StudyDocument,
  uploadAndAnalyzeStudyDocument,
} from '@/features/ai/study-documents';
import { KodaButton, KodaCard, KodaIconButton, KodaPageHeader, KodaPill, KodaScreen, KodaSectionTitle } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useKodaAuth } from '@/providers/koda-auth-provider';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function MaterialsScreen() {
  const { theme } = useKodaTheme();
  const { status } = useKodaAuth();
  const { addFlashcard, workspace } = useKodaData();
  const courses = useMemo(() => workspace.courses.filter((course) => course.isActive), [workspace.courses]);
  const [courseId, setCourseId] = useState('');
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isConsenting, setConsenting] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const selectedCourseId = courses.some((course) => course.id === courseId) ? courseId : courses[0]?.id ?? '';

  const loadDocuments = useCallback(async () => {
    if (status !== 'signed_in') return;
    try {
      const [nextDocuments, consent] = await Promise.all([listStudyDocuments(), getAiDocumentConsent()]);
      setDocuments(nextDocuments);
      setHasConsent(consent);
    } catch (error) {
      console.warn('No se pudieron cargar los materiales', error);
    }
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => void loadDocuments(), 0);
    return () => clearTimeout(timer);
  }, [loadDocuments]);

  const acceptConsent = async () => {
    try {
      setConsenting(true);
      await recordAiDocumentConsent();
      setHasConsent(true);
    } catch (error) {
      Alert.alert('No se pudo guardar tu decisión', error instanceof Error ? error.message : 'Intenta nuevamente.');
    } finally {
      setConsenting(false);
    }
  };

  const chooseAndAnalyze = async () => {
    if (status !== 'signed_in') {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta para guardar y proteger tus materiales.');
      return;
    }
    if (!hasConsent) {
      Alert.alert('Confirma el uso de IA', 'Lee y acepta el aviso antes de enviar un PDF para análisis.');
      return;
    }
    if (!selectedCourseId) {
      Alert.alert('Añade un curso', 'Primero registra un curso activo para clasificar el material.');
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;

    try {
      setLoading(true);
      await uploadAndAnalyzeStudyDocument({ asset: result.assets[0], courseId: selectedCourseId });
      await loadDocuments();
      Alert.alert('Análisis listo', 'Revisa el resumen, guarda las tarjetas que quieras y practica con el simulacro.');
    } catch (error) {
      Alert.alert('No se pudo analizar el PDF', error instanceof Error ? error.message : 'Intenta nuevamente más tarde.');
      await loadDocuments();
    } finally {
      setLoading(false);
    }
  };

  const importFlashcards = async (document: StudyDocument) => {
    if (!document.analysis || !document.courseId || !document.analysis.flashcards.length) return;
    try {
      setImportingId(document.id);
      document.analysis.flashcards.forEach((card) => {
        addFlashcard({ courseId: document.courseId!, prompt: card.question, answer: card.answer });
      });
      await markDocumentFlashcardsImported(document.id);
      await loadDocuments();
    } catch (error) {
      Alert.alert('No se pudieron guardar las tarjetas', error instanceof Error ? error.message : 'Intenta nuevamente.');
    } finally {
      setImportingId(null);
    }
  };

  const retryAnalysis = async (document: StudyDocument) => {
    try {
      setRetryingId(document.id);
      await analyzeStudyDocument(document.id);
      await loadDocuments();
      Alert.alert('Análisis listo', 'Ya puedes revisar el resumen, guardar tarjetas o practicar.');
    } catch (error) {
      Alert.alert('No se pudo analizar el PDF', error instanceof Error ? error.message : 'Intenta nuevamente más tarde.');
      await loadDocuments();
    } finally {
      setRetryingId(null);
    }
  };

  const removeDocument = (document: StudyDocument) => {
    Alert.alert('Eliminar material', 'Se borrará el PDF privado y su análisis. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteStudyDocument(document);
              await loadDocuments();
            } catch (error) {
              Alert.alert('No se pudo eliminar', error instanceof Error ? error.message : 'Intenta nuevamente.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="Materiales privados"
        title="Estudia desde tus apuntes"
        subtitle="KODA convierte un PDF en resumen, tarjetas y práctica. Tú revisas todo antes de usarlo."
        right={<KodaIconButton icon="chevron-back" label="Volver a repaso" onPress={() => router.back()} />}
      />

      <KodaCard style={[styles.privacyCard, { backgroundColor: theme.surfaceMuted }]}>
        <View style={[styles.privacyIcon, { backgroundColor: theme.accentSoft }]}>
          <Ionicons color={theme.accent} name="shield-checkmark-outline" size={21} />
        </View>
        <View style={styles.privacyCopy}>
          <Text style={[styles.privacyTitle, { color: theme.text }]}>Tu material permanece privado</Text>
          <Text style={[styles.privacyDetail, { color: theme.textSecondary }]}>Se guarda en un espacio privado de tu cuenta. Al analizarlo, se envía a Gemini; no subas información sensible de terceros.</Text>
        </View>
      </KodaCard>

      {status !== 'signed_in' ? (
        <KodaCard style={styles.noticeCard}>
          <Text style={[styles.noticeTitle, { color: theme.text }]}>Inicia sesión para usar materiales</Text>
          <Text style={[styles.noticeDetail, { color: theme.textSecondary }]}>Así cada PDF, análisis y resultado queda asociado únicamente a tu cuenta.</Text>
        </KodaCard>
      ) : null}

      {!hasConsent && status === 'signed_in' ? (
        <KodaCard style={styles.consentCard}>
          <View style={styles.consentCopy}>
            <Text style={[styles.consentTitle, { color: theme.text }]}>Antes de continuar</Text>
            <Text style={[styles.consentDetail, { color: theme.textSecondary }]}>Acepto que KODA envíe este PDF a Gemini para generar material de estudio. La IA puede equivocarse y debo verificar el resultado.</Text>
          </View>
          <KodaButton disabled={isConsenting} icon="checkmark-circle-outline" label={isConsenting ? 'Guardando…' : 'Acepto y continuar'} onPress={() => void acceptConsent()} />
        </KodaCard>
      ) : null}

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Analizar un PDF" />
        <View style={styles.pills}>
          {courses.map((course) => <KodaPill key={course.id} label={course.name} selected={course.id === selectedCourseId} onPress={() => setCourseId(course.id)} />)}
        </View>
        <KodaButton disabled={isLoading || !hasConsent || status !== 'signed_in' || !selectedCourseId} icon="document-text-outline" label={isLoading ? 'Analizando tu material…' : 'Elegir PDF de hasta 10 MB'} onPress={() => void chooseAndAnalyze()} />
        <Text style={[styles.limitText, { color: theme.textTertiary }]}>Límite inicial: 2 análisis de documentos por día. No reemplaza la revisión de tus apuntes.</Text>
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Tus análisis" />
        {documents.length ? documents.map((document) => {
          const course = courses.find((item) => item.id === document.courseId);
          return (
            <KodaCard key={document.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={[styles.documentIcon, { backgroundColor: document.analysisStatus === 'completed' ? theme.successSoft : theme.warningSoft }]}>
                  <Ionicons color={document.analysisStatus === 'completed' ? theme.success : theme.warning} name={document.analysisStatus === 'completed' ? 'sparkles-outline' : 'document-text-outline'} size={19} />
                </View>
                <View style={styles.documentCopy}>
                  <Text numberOfLines={1} style={[styles.documentName, { color: theme.text }]}>{document.analysis?.title ?? document.originalFilename}</Text>
                  <Text style={[styles.documentMeta, { color: theme.textSecondary }]}>{course?.name ?? 'Material de estudio'} · {statusLabel(document.analysisStatus)}</Text>
                </View>
                <KodaIconButton icon="trash-outline" label={'Eliminar ' + document.originalFilename} onPress={() => removeDocument(document)} />
              </View>

              {document.analysis ? (
                <View style={styles.analysisContent}>
                  <Text style={[styles.summary, { color: theme.textSecondary }]}>{document.analysis.summary}</Text>
                  {document.analysis.keyPoints.length ? (
                    <View style={styles.keyPointList}>
                      {document.analysis.keyPoints.map((point) => (
                        <View key={point} style={styles.keyPoint}>
                          <View style={[styles.keyDot, { backgroundColor: theme.accent }]} />
                          <Text style={[styles.keyPointText, { color: theme.textSecondary }]}>{point}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <View style={styles.documentActions}>
                    {document.analysis.flashcards.length ? (
                      <KodaButton
                        disabled={Boolean(document.flashcardsImportedAt) || importingId === document.id}
                        icon={document.flashcardsImportedAt ? 'checkmark' : 'layers-outline'}
                        label={document.flashcardsImportedAt ? 'Tarjetas guardadas' : importingId === document.id ? 'Guardando…' : `Guardar ${document.analysis.flashcards.length} tarjetas`}
                        onPress={() => void importFlashcards(document)}
                        variant="secondary"
                        style={styles.actionButton}
                      />
                    ) : null}
                    {document.analysis.quizQuestions.length ? (
                      <KodaButton icon="school-outline" label="Ir al simulacro" onPress={() => router.push('/simulations')} style={styles.actionButton} />
                    ) : null}
                  </View>
                </View>
              ) : (
                <View style={styles.analysisContent}>
                  <Text style={[styles.failureText, { color: theme.textSecondary }]}>{document.lastError ?? 'Este material está listo para ser analizado.'}</Text>
                  {document.analysisStatus === 'ready' || document.analysisStatus === 'failed' ? (
                    <KodaButton
                      disabled={retryingId === document.id}
                      icon="refresh-outline"
                      label={retryingId === document.id ? 'Reintentando…' : 'Reintentar análisis'}
                      onPress={() => void retryAnalysis(document)}
                      style={styles.actionButton}
                      variant="secondary"
                    />
                  ) : null}
                </View>
              )}
            </KodaCard>
          );
        }) : (
          <KodaCard style={styles.emptyCard}>
            <Ionicons color={theme.textTertiary} name="folder-open-outline" size={23} />
            <View style={styles.emptyCopy}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Aún no tienes materiales</Text>
              <Text style={[styles.emptyDetail, { color: theme.textSecondary }]}>Sube un PDF propio para convertirlo en un recurso de repaso.</Text>
            </View>
          </KodaCard>
        )}
      </View>
    </KodaScreen>
  );
}

function statusLabel(status: StudyDocument['analysisStatus']) {
  return { ready: 'listo para analizar', processing: 'analizando', completed: 'análisis listo', failed: 'requiere atención' }[status];
}

const styles = StyleSheet.create({
  privacyCard: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  privacyIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 42, justifyContent: 'center', width: 42 },
  privacyCopy: { flex: 1, gap: 3 },
  privacyTitle: { fontSize: 14, fontWeight: '900' },
  privacyDetail: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  noticeCard: { gap: 4, padding: KodaSpacing.lg },
  noticeTitle: { fontSize: 15, fontWeight: '900' },
  noticeDetail: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  consentCard: { gap: KodaSpacing.lg, padding: KodaSpacing.lg },
  consentCopy: { gap: 4 },
  consentTitle: { fontSize: 15, fontWeight: '900' },
  consentDetail: { fontSize: 13, fontWeight: '600', lineHeight: 20 },
  sectionBlock: { gap: KodaSpacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: KodaSpacing.sm },
  limitText: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  documentCard: { gap: KodaSpacing.lg, padding: KodaSpacing.lg },
  documentHeader: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md },
  documentIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 42, justifyContent: 'center', width: 42 },
  documentCopy: { flex: 1, gap: 3 },
  documentName: { fontSize: 14, fontWeight: '900' },
  documentMeta: { fontSize: 12, fontWeight: '600' },
  analysisContent: { gap: KodaSpacing.md },
  summary: { fontSize: 13, fontWeight: '600', lineHeight: 20 },
  keyPointList: { gap: 7 },
  keyPoint: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  keyDot: { borderRadius: KodaRadius.pill, height: 6, marginTop: 7, width: 6 },
  keyPointText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  documentActions: { gap: KodaSpacing.sm },
  actionButton: { width: '100%' },
  failureText: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  emptyCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  emptyCopy: { flex: 1, gap: 2 },
  emptyTitle: { fontSize: 14, fontWeight: '900' },
  emptyDetail: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
});
