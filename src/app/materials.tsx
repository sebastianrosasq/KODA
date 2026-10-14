import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import {
  analyzeStudyDocument,
  deleteStudyDocument,
  getAiDocumentConsent,
  listStudyDocuments,
  markDocumentFlashcardsImported,
  recordAiDocumentConsent,
  type StudyDocument,
  type StudyDocumentRole,
  uploadStudyDocument,
} from '@/features/ai/study-documents';
import { KodaButton, KodaCard, KodaIconButton, KodaPageHeader, KodaPill, KodaScreen, KodaSectionTitle } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useKodaAuth } from '@/providers/koda-auth-provider';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function MaterialsScreen() {
  const { theme } = useKodaTheme();
  const { status } = useKodaAuth();
  const { addFlashcard, applySyllabusProposal, workspace } = useKodaData();
  const courses = useMemo(() => workspace.courses.filter((course) => course.isActive), [workspace.courses]);
  const [courseId, setCourseId] = useState('');
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'analyzing'>('idle');
  const [isLoadingDocuments, setLoadingDocuments] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [isConsenting, setConsenting] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadRole, setUploadRole] = useState<StudyDocumentRole>('study_material');
  const [flashcardTarget, setFlashcardTarget] = useState(3);
  const selectedCourseId = courses.some((course) => course.id === courseId) ? courseId : courses[0]?.id ?? '';

  const loadDocuments = useCallback(async () => {
    if (status !== 'signed_in') {
      setLoadingDocuments(false);
      return;
    }
    try {
      setLoadingDocuments(true);
      const [nextDocuments, consent] = await Promise.all([listStudyDocuments(), getAiDocumentConsent()]);
      setDocuments(nextDocuments);
      setHasConsent(consent);
    } catch (error) {
      console.warn('No se pudieron cargar los materiales', error);
    } finally {
      setLoadingDocuments(false);
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

  const chooseAndUpload = async () => {
    if (status !== 'signed_in') {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta para guardar y proteger tus materiales.');
      return;
    }
    if (!selectedCourseId) {
      Alert.alert('Añade un curso', 'Primero registra un curso activo para clasificar el material.');
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: uploadRole === 'syllabus'
        ? 'application/pdf'
        : [
          'application/pdf',
          'audio/mpeg',
          'audio/mp3',
          'audio/wav',
          'audio/aac',
          'audio/ogg',
          'audio/flac',
          'audio/webm',
          'audio/m4a',
          'audio/mp4',
        ],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;

    try {
      setUploadStage('uploading');
      setFeedback(null);
      const { documentId } = await uploadStudyDocument({
        asset: result.assets[0],
        courseId: selectedCourseId,
        role: uploadRole,
        flashcardTarget: uploadRole === 'study_material' ? flashcardTarget : 3,
      });
      await loadDocuments();
      if (!hasConsent) {
        setFeedback(uploadRole === 'syllabus'
          ? 'Sílabo guardado. Acepta el uso de IA para extraer unidades, fechas y una agenda propuesta.'
          : 'Material guardado. Acepta el uso de IA cuando quieras convertirlo en resumen, tarjetas y práctica.');
        return;
      }

      try {
        setUploadStage('analyzing');
        await analyzeStudyDocument(documentId, uploadRole === 'study_material' ? flashcardTarget : 3);
        await loadDocuments();
        setFeedback(uploadRole === 'syllabus'
          ? 'Sílabo analizado. Revisa la agenda sugerida y decide si quieres aplicarla.'
          : 'Análisis listo. Revisa el resumen, guarda las tarjetas que quieras y practica.');
      } catch (error) {
        await loadDocuments();
        setFeedback(`Tu material se guardó. ${error instanceof Error ? error.message : 'El análisis podrá reintentarse más tarde.'}`);
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo guardar el material. Intenta nuevamente más tarde.');
      await loadDocuments();
    } finally {
      setUploadStage('idle');
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
    if (!hasConsent) {
      setFeedback('Acepta el uso de IA antes de analizar este material. El archivo ya está guardado de forma privada.');
      return;
    }
    try {
      setRetryingId(document.id);
      await analyzeStudyDocument(document.id, document.flashcardTarget);
      await loadDocuments();
      setFeedback('Análisis listo. Ya puedes revisar el resumen, guardar tarjetas o practicar.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo analizar el material. Intenta nuevamente más tarde.');
      await loadDocuments();
    } finally {
      setRetryingId(null);
    }
  };

  const removeDocument = (document: StudyDocument) => {
    Alert.alert('Eliminar material', 'Se borrará el PDF o audio privado y su análisis. Esta acción no se puede deshacer.', [
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

  const applySyllabus = (document: StudyDocument) => {
    if (!document.courseId || !document.analysis?.syllabus) return;
    const proposal = document.analysis.syllabus;
    Alert.alert(
      '¿Aplicar agenda sugerida?',
      `Se añadirán ${proposal.units.flatMap((unit) => unit.topics).length} temas y ${proposal.calendarEvents.length} fechas a este curso. Puedes borrar o editar cualquier evento después.`,
      [
        { text: 'Revisar después', style: 'cancel' },
        {
          text: 'Aplicar calendario',
          onPress: () => {
            applySyllabusProposal({ courseId: document.courseId!, ...proposal });
            setFeedback('La agenda del sílabo se añadió a tu plan. Revisa las fechas antes de estudiar.');
          },
        },
      ],
    );
  };

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="Materiales privados"
        title="Estudia desde tus apuntes"
        subtitle="KODA convierte PDFs y audios en resumen, tarjetas y práctica. Tú revisas todo antes de usarlo."
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

      <KodaCard style={[styles.coachCard, { backgroundColor: theme.accentSoft, borderColor: theme.accentSoft }]}>
        <View style={styles.coachCopy}>
          <Text style={[styles.coachTitle, { color: theme.text }]}>¿Tienes una duda puntual?</Text>
          <Text style={[styles.coachDetail, { color: theme.textSecondary }]}>Conversa con KODA sobre un material ya analizado o recibe una guía breve para repasar.</Text>
        </View>
        <KodaButton icon="chatbubble-ellipses-outline" label="Chat IA" onPress={() => router.push('/coach')} variant="secondary" />
      </KodaCard>

      {status !== 'signed_in' ? (
        <KodaCard style={styles.noticeCard}>
          <Text style={[styles.noticeTitle, { color: theme.text }]}>Inicia sesión para usar materiales</Text>
          <Text style={[styles.noticeDetail, { color: theme.textSecondary }]}>Así cada PDF, análisis y resultado queda asociado únicamente a tu cuenta.</Text>
        </KodaCard>
      ) : null}

      {!isLoadingDocuments && !hasConsent && status === 'signed_in' ? (
        <KodaCard style={styles.consentCard}>
          <View style={styles.consentCopy}>
            <Text style={[styles.consentTitle, { color: theme.text }]}>Antes de continuar</Text>
          <Text style={[styles.consentDetail, { color: theme.textSecondary }]}>Acepto que KODA envíe este PDF o audio a Gemini para generar material de estudio. Puedes guardar materiales privados antes de aceptar. La IA puede equivocarse y debo verificar el resultado.</Text>
          </View>
          <KodaButton disabled={isConsenting} icon="checkmark-circle-outline" label={isConsenting ? 'Guardando…' : 'Acepto y continuar'} onPress={() => void acceptConsent()} />
        </KodaCard>
      ) : null}

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title={uploadRole === 'syllabus' ? 'Subir sílabo del curso' : 'Guardar un PDF o audio'} />
        <View style={styles.pills}>
          <KodaPill label="Material de estudio" selected={uploadRole === 'study_material'} onPress={() => setUploadRole('study_material')} />
          <KodaPill label="Sílabo (PDF)" selected={uploadRole === 'syllabus'} onPress={() => setUploadRole('syllabus')} />
        </View>
        <View style={styles.pills}>
          {courses.map((course) => <KodaPill key={course.id} label={course.name} selected={course.id === selectedCourseId} onPress={() => setCourseId(course.id)} />)}
        </View>
        {uploadRole === 'study_material' ? (
          <>
            <Text style={[styles.countLabel, { color: theme.textSecondary }]}>TARJETAS QUE QUIERES GENERAR</Text>
            <View style={styles.pills}>
              {Array.from({ length: 6 }, (_, index) => index + 1).map((count) => (
                <KodaPill key={count} label={String(count)} selected={flashcardTarget === count} onPress={() => setFlashcardTarget(count)} />
              ))}
            </View>
          </>
        ) : null}
        <KodaButton
          disabled={uploadStage !== 'idle' || status !== 'signed_in' || !selectedCourseId}
          icon="cloud-upload-outline"
          label={uploadStage === 'uploading' ? 'Guardando archivo…' : uploadStage === 'analyzing' ? 'Analizando con IA…' : uploadRole === 'syllabus' ? 'Elegir sílabo PDF · hasta 12 MB' : 'Elegir PDF o audio · hasta 12 MB'}
          onPress={() => void chooseAndUpload()}
        />
        <Text style={[styles.limitText, { color: theme.textTertiary }]}>{uploadRole === 'syllabus' ? 'KODA identifica unidades, temas, evaluaciones y actividades. Tú decides si aplicas su agenda.' : `Generará ${flashcardTarget} tarjetas revisables (máximo 6). Formatos: PDF, MP3, WAV, M4A, AAC, OGG, FLAC y WEBM. Límite diario de IA: 3 PDFs y 5 audios.`}</Text>
        {feedback ? <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>{feedback}</Text> : null}
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Tus análisis" />
        {isLoadingDocuments ? (
          <KodaCard style={styles.emptyCard}>
            <ActivityIndicator accessibilityLabel="Cargando tus materiales" color={theme.accent} />
            <View style={styles.emptyCopy}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Cargando tus materiales</Text>
              <Text style={[styles.emptyDetail, { color: theme.textSecondary }]}>Estamos recuperando tus análisis privados.</Text>
            </View>
          </KodaCard>
        ) : documents.length ? documents.map((document) => {
          const course = courses.find((item) => item.id === document.courseId);
          return (
            <KodaCard key={document.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={[styles.documentIcon, { backgroundColor: document.analysisStatus === 'completed' ? theme.successSoft : theme.warningSoft }]}>
                  <Ionicons color={document.analysisStatus === 'completed' ? theme.success : theme.warning} name={document.analysisStatus === 'completed' ? 'sparkles-outline' : document.contentKind === 'audio' ? 'musical-notes-outline' : 'document-text-outline'} size={19} />
                </View>
                <View style={styles.documentCopy}>
                  <Text numberOfLines={1} style={[styles.documentName, { color: theme.text }]}>{document.analysis?.title ?? document.originalFilename}</Text>
                  <Text style={[styles.documentMeta, { color: theme.textSecondary }]}>{course?.name ?? 'Material de estudio'} · {document.documentRole === 'syllabus' ? 'sílabo PDF' : document.contentKind === 'audio' ? 'audio' : 'PDF'} · {statusLabel(document.analysisStatus)}</Text>
                </View>
                <KodaIconButton icon="trash-outline" label={'Eliminar ' + document.originalFilename} onPress={() => removeDocument(document)} />
              </View>

              {document.analysis ? (
                <View style={styles.analysisContent}>
                  <Text style={[styles.summary, { color: theme.textSecondary }]}>{document.analysis.summary}</Text>
                  {document.documentRole === 'syllabus' && document.analysis.syllabus ? (
                    <View style={[styles.syllabusCard, { backgroundColor: theme.accentSoft }] }>
                      <Text style={[styles.syllabusTitle, { color: theme.text }]}>Agenda propuesta por tu sílabo</Text>
                      <Text style={[styles.syllabusDetail, { color: theme.textSecondary }]}>{document.analysis.syllabus.units.length} unidades/temas detectados · {document.analysis.syllabus.calendarEvents.length} fechas verificables</Text>
                      {document.analysis.syllabus.units.flatMap((unit) => unit.topics).slice(0, 4).map((topic) => (
                        <Text key={topic} style={[styles.syllabusPreview, { color: theme.textSecondary }]}>• {topic}</Text>
                      ))}
                      {document.analysis.syllabus.calendarEvents.slice(0, 5).map((event) => (
                        <Text key={`${event.title}-${event.dateIso}`} style={[styles.syllabusPreview, { color: theme.textSecondary }]}>• {event.dateIso}: {event.title}</Text>
                      ))}
                      <KodaButton icon="calendar-outline" label="Aplicar al plan" onPress={() => applySyllabus(document)} variant="secondary" style={styles.actionButton} />
                    </View>
                  ) : null}
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
                    <KodaButton
                      icon="chatbubble-ellipses-outline"
                      label="Preguntar a KODA"
                      onPress={() => router.push({ pathname: '/coach', params: { documentId: document.id } })}
                      style={styles.actionButton}
                      variant="secondary"
                    />
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
              <Text style={[styles.emptyDetail, { color: theme.textSecondary }]}>Sube un PDF o audio propio para convertirlo en un recurso de repaso.</Text>
            </View>
          </KodaCard>
        )}
      </View>
    </KodaScreen>
  );
}

function statusLabel(status: StudyDocument['analysisStatus']) {
  return { ready: 'guardado · pendiente de análisis', processing: 'analizando', completed: 'análisis listo', failed: 'requiere atención' }[status];
}

const styles = StyleSheet.create({
  privacyCard: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  privacyIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 42, justifyContent: 'center', width: 42 },
  privacyCopy: { flex: 1, gap: 3, minWidth: 0 },
  privacyTitle: { fontSize: 14, fontWeight: '900' },
  privacyDetail: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  coachCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  coachCopy: { flex: 1, gap: 3, minWidth: 0 },
  coachTitle: { fontSize: 14, fontWeight: '900' },
  coachDetail: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
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
  countLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  feedbackText: { fontSize: 12, fontWeight: '700', lineHeight: 18 },
  documentCard: { gap: KodaSpacing.lg, padding: KodaSpacing.lg },
  documentHeader: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md },
  documentIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 42, justifyContent: 'center', width: 42 },
  documentCopy: { flex: 1, gap: 3, minWidth: 0 },
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
  syllabusCard: { borderRadius: KodaRadius.md, gap: KodaSpacing.sm, padding: KodaSpacing.md },
  syllabusTitle: { fontSize: 13, fontWeight: '900' },
  syllabusDetail: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  syllabusPreview: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  emptyCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  emptyCopy: { flex: 1, gap: 2, minWidth: 0 },
  emptyTitle: { fontSize: 14, fontWeight: '900' },
  emptyDetail: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
});
