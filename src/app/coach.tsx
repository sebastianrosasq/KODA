import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { KodaButton, KodaCard, KodaIconButton, KodaPageHeader, KodaPill, KodaScreen } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { askStudyCoach } from '@/features/ai/study-coach';
import { getAiDocumentConsent, listStudyDocuments, recordAiDocumentConsent, type StudyDocument } from '@/features/ai/study-documents';
import { useKodaTheme } from '@/providers/koda-theme-provider';

type CoachMessage = { id: string; role: 'assistant' | 'student'; text: string };

const welcomeMessage: CoachMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hola, soy KODA. Puedo ayudarte a preparar tu examen, explicarte un concepto o preguntarte sobre un material que ya analizaste.',
};

export default function CoachScreen() {
  const { theme } = useKodaTheme();
  const params = useLocalSearchParams<{ documentId?: string | string[] }>();
  const initialDocumentId = typeof params.documentId === 'string' ? params.documentId : '';
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(initialDocumentId);
  const [hasConsent, setHasConsent] = useState(false);
  const [isConsenting, setConsenting] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isSending, setSending] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([welcomeMessage]);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);

  const analyzedDocuments = useMemo(
    () => documents.filter((document) => document.analysisStatus === 'completed' && document.analysis),
    [documents],
  );

  const load = useCallback(async () => {
    try {
      const [nextDocuments, consent] = await Promise.all([listStudyDocuments(), getAiDocumentConsent()]);
      setDocuments(nextDocuments);
      setHasConsent(consent);
      if (!selectedDocumentId && nextDocuments.some((document) => document.analysisStatus === 'completed')) {
        setSelectedDocumentId(nextDocuments.find((document) => document.analysisStatus === 'completed')!.id);
      }
    } catch (error) {
      console.warn('No se pudo cargar el contexto para KODA IA', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDocumentId]);

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
      Alert.alert('No se pudo guardar tu decisión', error instanceof Error ? error.message : 'Intenta nuevamente.');
    } finally {
      setConsenting(false);
    }
  };

  const submit = async () => {
    const message = prompt.trim();
    if (!message) return;
    if (!hasConsent) {
      Alert.alert('Confirma el uso de IA', 'Primero confirma que KODA puede enviar tu pregunta a Gemini.');
      return;
    }

    const studentMessage: CoachMessage = { id: `student-${Date.now()}`, role: 'student', text: message };
    setPrompt('');
    setMessages((current) => [...current, studentMessage]);
    try {
      setSending(true);
      const reply = await askStudyCoach({ message, documentId: selectedDocumentId || undefined });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: reply.answer }]);
      setRemainingMessages(reply.remainingMessages);
    } catch (error) {
      Alert.alert('KODA no pudo responder', error instanceof Error ? error.message : 'Intenta nuevamente más tarde.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="KODA IA"
        title="Tu compañero de repaso"
        subtitle="Las respuestas usan tu material seleccionado cuando esté disponible. Verifica siempre lo importante."
        right={<KodaIconButton icon="chevron-back" label="Volver" onPress={() => router.back()} />}
      />

      {!hasConsent ? (
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
        {isLoading ? <ActivityIndicator color={theme.accent} /> : null}
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
        {!isLoading && !analyzedDocuments.length ? (
          <Text style={[styles.contextHint, { color: theme.textTertiary }]}>Sube un PDF o audio desde Materiales para hacer preguntas directamente sobre él.</Text>
        ) : null}
      </View>

      <View style={styles.messages}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.role === 'student' ? styles.studentRow : styles.assistantRow]}>
            {message.role === 'assistant' ? <Ionicons color={theme.accent} name="sparkles-outline" size={18} style={styles.messageIcon} /> : null}
            <View style={[styles.messageBubble, { backgroundColor: message.role === 'student' ? theme.accent : theme.surfaceMuted, borderColor: message.role === 'student' ? theme.accent : theme.border }]}>
              <Text style={[styles.messageText, { color: message.role === 'student' ? theme.onAccent : theme.text }]}>{message.text}</Text>
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

      <KodaCard style={styles.composer}>
        <TextInput
          accessibilityLabel="Pregunta para KODA"
          editable={!isSending}
          maxLength={1200}
          multiline
          onChangeText={setPrompt}
          placeholder="Ejemplo: explícamelo con un caso práctico"
          placeholderTextColor={theme.textTertiary}
          style={[styles.input, { color: theme.text }]}
          textAlignVertical="top"
          value={prompt}
        />
        <View style={styles.composerFooter}>
          <Text style={[styles.quota, { color: theme.textTertiary }]}>{remainingMessages === null ? 'Hasta 8 mensajes de IA al día' : `${remainingMessages} mensajes de IA restantes hoy`}</Text>
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
  messageText: { fontSize: 14, fontWeight: '600', lineHeight: 21 },
  typing: { fontSize: 13, fontWeight: '600' },
  composer: { gap: KodaSpacing.md, padding: KodaSpacing.md },
  input: { fontSize: 15, fontWeight: '600', lineHeight: 22, minHeight: 76, padding: KodaSpacing.xs },
  composerFooter: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm, justifyContent: 'space-between' },
  quota: { flex: 1, fontSize: 11, fontWeight: '700', lineHeight: 16 },
});
