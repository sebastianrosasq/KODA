import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { AccountModal } from '@/features/auth/account-modal';
import { KodaSpacing } from '@/constants/koda-theme';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export function KodaAccessGate({ isChecking, isUnavailable }: { isChecking: boolean; isUnavailable: boolean }) {
  const { theme } = useKodaTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.brand}>
        <Image accessibilityLabel="Logotipo de KODA" source={require('@/assets/images/koda-mark.png')} style={styles.mark} />
        <Text style={[styles.name, { color: theme.text }]}>KODA</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>Tu semana de exámenes, en orden.</Text>
      </View>
      {isChecking ? <ActivityIndicator color={theme.accent} size="large" /> : null}
      {isUnavailable ? (
        <Text style={[styles.unavailable, { color: theme.textSecondary }]}>El acceso a cuentas todavía se está preparando. Reintenta en unos minutos.</Text>
      ) : null}
      {!isChecking && !isUnavailable ? <AccountModal onClose={() => undefined} required /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: KodaSpacing.xl },
  brand: { alignItems: 'center', gap: KodaSpacing.sm, marginBottom: KodaSpacing.xxl },
  mark: { height: 68, width: 68 },
  name: { fontSize: 22, fontWeight: '900', letterSpacing: 3 },
  tagline: { fontSize: 14, fontWeight: '600' },
  unavailable: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
