import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { KodaButton, KodaIconButton } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useKodaAuth } from '@/providers/koda-auth-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export function AccountModal({ onClose }: { onClose: () => void }) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const { isConfigured, signIn, signInWithGoogle, signUp } = useKodaAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (mode: 'signIn' | 'signUp') => {
    setLoading(true);
    const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    setMessage(result ?? (mode === 'signIn' ? 'Sesión iniciada.' : 'Cuenta creada. Revisa tu correo si requiere confirmación.'));
  };

  const submitGoogle = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    setMessage(result ?? 'Sesión iniciada con Google.');
  };

  return (
    <Modal animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={onClose} transparent visible>
      <Pressable accessibilityLabel="Cerrar acceso a cuenta" onPress={onClose} style={[styles.overlay, { backgroundColor: theme.overlay + '99' }]}>
        <Pressable onPress={() => undefined} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>Tu cuenta KODA</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Guarda tu avance y continúa desde cualquier dispositivo.</Text>
            </View>
            <KodaIconButton icon="close" label="Cerrar" onPress={onClose} />
          </View>

          {!isConfigured ? (
            <View style={[styles.notice, { backgroundColor: theme.accentSoft }]}>
              <Ionicons color={theme.accent} name="cloud-offline-outline" size={19} />
              <Text style={[styles.noticeText, { color: theme.textSecondary }]}>Supabase aún no está vinculado. Tus datos siguen disponibles solo en este dispositivo.</Text>
            </View>
          ) : (
            <>
              <KodaButton disabled={loading} icon="logo-google" label="Continuar con Google" onPress={() => void submitGoogle()} variant="secondary" />
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textTertiary }]}>O CON CORREO</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>
              <TextInput
                accessibilityLabel="Correo electrónico"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                value={email}
              />
              <TextInput
                accessibilityLabel="Contraseña"
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                value={password}
              />
              {message ? <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text> : null}
              {loading ? <ActivityIndicator color={theme.accent} /> : null}
              <KodaButton label="Iniciar sesión" disabled={loading} onPress={() => void submit('signIn')} />
              <KodaButton label="Crear cuenta con correo" disabled={loading} onPress={() => void submit('signUp')} variant="secondary" />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', padding: KodaSpacing.md },
  card: { borderRadius: KodaRadius.lg, borderWidth: 1, gap: KodaSpacing.md, maxWidth: 560, padding: KodaSpacing.xl, width: '100%' },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.md, justifyContent: 'space-between' },
  headerCopy: { flex: 1 },
  title: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 3 },
  notice: { alignItems: 'flex-start', borderRadius: KodaRadius.md, flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.md },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  divider: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  input: { borderRadius: KodaRadius.md, borderWidth: 1, fontSize: 16, minHeight: 50, paddingHorizontal: KodaSpacing.md },
  message: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
