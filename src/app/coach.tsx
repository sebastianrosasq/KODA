import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { KodaButton, KodaCard, KodaIconButton, KodaPageHeader, KodaPill, KodaScreen } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import {
  askStudyCoach,
  clearStudyCoachMessages,
  listStudyCoachMessages,
  type StudyCoachMessage,
} from '@/features/ai/study-coach';
import { getAiDocumentConsent, listStudyDocuments, recordAiDocumentConsent, type StudyDocument } from '@/features/ai/study-documents';
import { useKodaTheme } from '@/providers/koda-theme-provider';
import { useKodaFeedback } from '@/providers/koda-feedback-provider';

type CoachMessage = Pick<StudyCoachMessage, 'id' | 'role' | 'text'>;

const welcomeMessage: CoachMessage = {
  id: 'welcome',
  role: 'assistant',
  text: '¿Qué necesitas repasar?',
};

function CoachMessageText({ message, color }: { message: CoachMessage; color: string }) {
  const fragments = message.text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <Text style={[styles.messageText, { color, fontWeight: message.role === 'student' ? '700' : '500' }]}>
      {fragments.map((fragment, index) => {
        if (fragment.startsWith('**') && fragment.endsWith('**')) {
          return <Text key={`${index}-${fragment}`} style={styles.messageStrong}>{fragment.slice(2, -2)}</Text>;
        }
        if (fragment.startsWith('*') && fragment.endsWith('*')) {
          return <Text key={`${index}-${fragment}`} style={styles.messageEmphasis}>{fragment.slice(1, -1)}</Text>;
        }
        return fragment;
      })}
    </Text>
  );
}

export default function CoachScreen() {
  const { theme } = useKodaTheme();
  const { confirm, showNotice } = useKodaFeedback();
  const params = useLocalSearchParams<{ documentId?: string | string[] }>();
  const initialDocumentId = typeof params.documentId === 'string' ? params.documentId : '';
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(() => initialDocumentId);
  const [hasConsent, setHasConsent] = useState(false);
  const [isConsenting, setConsenting] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isSending, setSending] = useState(false);
  const [isClearingHistory, setClearingHistory] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([welcomeMessage]);
  const [requestError, setRequestError] = useState<string | null>(null);

  const analyzedDocuments = useMemo(
    () => documents.filter((document) => document.analysisStatus === 'completed' && document.analysis),
    [documents],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [nextDocuments, consent, previousMessages] = await Promise.all([
        listStudyDocuments(),
        getAiDocumentConsent(),
        listStudyCoachMessages(),
      ]);
      setDocuments(nextDocuments);
      setHasConsent(consent);
      setMessages(previousMessages.length ? previousMessages : [welcomeMessage]);
      setSelectedDocumentId((current) => initialDocumentId || current || nextDocuments.find((document) => document.analysisStatus === 'completed')?.id || '');
    } catch (error) {
      console.warn('No se pudo cargar el contexto para KODA IA', error);
      setRequestError('No se pudo recuperar por completo tu historial. Vuelve a intentarlo en unos momentos.');
    } finally {
      setLoading(false);
    }
  }, [initialDocumentId]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const acceptConsent = async () => {
    try {
      setConsenting(true);
      await recordAiDocumentConsent();
      setHasConsent(true);
    } catch (error) {
      showNotice({ title: 'No se pudo guardar tu decisión', message: error instanceof Error ? error.message : 'Intenta nuevamente.', tone: 'danger' });
    } finally {
      setConsenting(false);
    }
  };

  const submit = async () => {
    const message = prompt.trim();
    if (!message) return;
    if (!hasConsent) {
      setRequestError('Acepta el uso de IA para activar el chat. Tus preguntas se enviarán a Gemini solo cuando las mandes.');
      return;
    }

    const studentMessage: CoachMessage = { id: `student-${Date.now()}`, role: 'student', text: message };
    setRequestError(null);
    setPrompt('');
    setMessages((current) => [...current, studentMessage]);
    try {
      setSending(true);
      const reply = await askStudyCoach({ message, documentId: selectedDocumentId || undefined });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: reply.answer }]);
      if (!reply.historySaved) {
        setRequestError('La respuesta llegó, pero no se pudo guardar en tu historial. Intenta recargar antes de salir.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'KODA no pudo responder en este momento.';
      setRequestError(errorMessage);
      setMessages((current) => [...current, {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text: `Aún no puedo responder esta consulta. ${errorMessage}`,
      }]);
    } finally {
      setSending(false);
    }
  };

  const confirmClearHistory = async () => {
    const accepted = await confirm({
      title: '¿Limpiar historial?',
      message: 'Se eliminarán tus preguntas y respuestas guardadas de esta cuenta. Esta acción no se puede deshacer.',
      confirmLabel: 'Limpiar',
      destructive: true,
    });
    if (!accepted) return;
    try {
      setClearingHistory(true);
      await clearStudyCoachMessages();
      setMessages([welcomeMessage]);
      setRequestError(null);
      showNotice({ title: 'Historial eliminado', message: 'Tu próxima conversación empezará desde cero.' });
    } catch (error) {
      showNotice({ title: 'No se pudo limpiar el historial', message: error instanceof Error ? error.message : 'Intenta nuevamente.', tone: 'danger' });
    } finally {
      setClearingHistory(false);
    }
  };

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="KODA IA"
        title="Tu compañero de repaso"
        subtitle="Puedes preguntar sin subir nada; un material solo añade contexto específico. Tu historial queda en tu cuenta."
        right={
          <View style={styles.headerActions}>
            {messages.length > 1 ? <KodaIconButton icon="trash-outline" label={isClearingHistory ? 'Limpiando historial' : 'Limpiar historial'} onPress={isClearingHistory ? undefined : () => void confirmClearHistory()} style={isClearingHistory ? styles.disabledAction : undefined} /> : null}
            <KodaIconButton icon="chevron-back" label="Volver" onPress={() => router.back()} />
          </View>
        }
      />

      {!isLoading && !hasConsent ? (
        <KodaCard style={[styles.consentCard, { backgroundColor: theme.surfaceMuted }]}>
          <View style={styles.consentCopy}>
            <Text style={[styles.consentTitle, { color: theme.text }]}>Antes de conversar</Text>
            <Text style={[styles.consentText, { color: theme.textSecondary }]}>Acepto que KODA envíe mi pregunta y, si lo selecciono, el análisis de mi PDF o audio a Gemini. No escribas datos sensibles de otras personas.</Text>
          </View>
          <KodaButton disabled={isConsenting} icon="checkmark-circle-outline" label={isConsenting ? 'Guardando…' : 'Acepto y continuar'} onPress={() => void acceptConsent()} />
        </KodaCard>
      ) : null}

      <View style={styles.contextBlock}>
        <View style={styles.contextHeader}>
          <Text style={[styles.contextTitle, { color: theme.text }]}>Contexto de estudio</Text>
          <KodaButton icon="cloud-upload-outline" label="Subir material" onPress={() => router.push('/materials')} variant="quiet" />
        </View>
        {isLoading ? <ActivityIndicator accessibilityLabel="Cargando tu material" color={theme.accent} /> : (
          <View style={styles.pills}>
            <KodaPill label="Sin material" onPress={() => setSelectedDocumentId('')} selected={!selectedDocumentId} />
            {analyzedDocuments.map((document) => (
              <KodaPill
                key={document.id}
                label={document.analysis?.title ?? document.originalFilename}
                onPress={() => setSelectedDocumentId(document.id)}
                selected={selectedDocumentId === document.id}
              />
            ))}
          </View>
        )}
        {!isLoading && !analyzedDocuments.length ? (
          <Text style={[styles.contextHint, { color: theme.textTertiary }]}>Opcional: sube un material si quieres respuestas basadas en tus apuntes.</Text>
        ) : null}
      </View>

      <View style={styles.messages}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.role === 'student' ? styles.studentRow : styles.assistantRow]}>
            {message.role === 'assistant' ? <Ionicons color={theme.accent} name="sparkles-outline" size={18} style={styles.messageIcon} /> : null}
            <View style={[styles.messageBubble, { backgroundColor: message.role === 'student' ? theme.accent : theme.surfaceMuted, borderColor: message.role === 'student' ? theme.accent : theme.border }]}>
              <CoachMessageText color={message.role === 'student' ? theme.onAccent : theme.text} message={message} />
            </View>
          </View>
        ))}
        {isSending ? (
          <View style={styles.assistantRow}>
            <ActivityIndicator color={theme.accent} />
            <Text style={[styles.typing, { color: theme.textSecondary }]}>KODA está preparando una respuesta…</Text>
          </View>
        ) : null}
      </View>

      {requestError ? <Text style={[styles.requestError, { color: theme.warning }]}>{requestError}</Text> : null}

      <KodaCard style={styles.composer}>
        <TextInput
          accessibilityLabel="Pregunta para KODA"
          editable={!isSending}
          maxLength={1200}
          multiline
          onChangeText={setPrompt}
          onSubmitEditing={() => {
            if (Platform.OS !== 'web') void submit();
          }}
          placeholder="Ejemplo: explícamelo con un caso práctico"
          placeholderTextColor={theme.textTertiary}
          returnKeyType="send"
          submitBehavior={Platform.OS === 'web' ? 'newline' : 'submit'}
          style={[styles.input, { color: theme.text }]}
          textAlignVertical="top"
          value={prompt}
        />
        <View style={styles.composerFooter}>
          <Text style={[styles.quota, { color: theme.textTertiary }]}>{hasConsent ? (isLoading ? 'Preparando tu chat…' : 'KODA IA está lista para ayudarte.') : isLoading ? 'Cargando tu chat…' : 'Acepta el aviso de IA para activar el chat.'}</Text>
          <KodaButton disabled={isSending || !prompt.trim() || !hasConsent} icon="send-outline" label={isSending ? 'Enviando…' : 'Enviar'} onPress={() => void submit()} />
        </View>
      </KodaCard>
    </KodaScreen>
  );
}

const styles = StyleSheet.create({
  consentCard: { gap: KodaSpacing.lg, padding: KodaSpacing.lg },
  consentCopy: { gap: 4 },
  consentTitle: { fontSize: 15, fontWeight: '900' },
  consentText: { fontSize: 13, fontWeight: '600', lineHeight: 20 },
  headerActions: { flexDirection: 'row', gap: KodaSpacing.sm },
  disabledAction: { opacity: 0.45 },
  contextBlock: { gap: KodaSpacing.sm },
  contextHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  contextTitle: { fontSize: 16, fontWeight: '900' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: KodaSpacing.sm },
  contextHint: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  messages: { gap: KodaSpacing.md },
  messageRow: { alignItems: 'flex-end', flexDirection: 'row', gap: KodaSpacing.sm },
  assistantRow: { alignSelf: 'flex-start' },
  studentRow: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  messageIcon: { marginBottom: KodaSpacing.sm },
  messageBubble: { borderRadius: KodaRadius.md, borderWidth: 1, maxWidth: '86%', padding: KodaSpacing.md },
  messageText: { fontSize: 14, lineHeight: 21 },
  messageStrong: { fontWeight: '900' },
  messageEmphasis: { fontStyle: 'italic' },
  typing: { fontSize: 13, fontWeight: '600' },
  composer: { gap: KodaSpacing.md, padding: KodaSpacing.md },
  input: { fontSize: 15, fontWeight: '600', lineHeight: 22, minHeight: 76, padding: KodaSpacing.xs },
  composerFooter: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm, justifyContent: 'space-between' },
  quota: { flex: 1, fontSize: 11, fontWeight: '700', lineHeight: 16 },
  requestError: { fontSize: 12, fontWeight: '700', lineHeight: 18 },
});
