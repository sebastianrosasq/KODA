import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';

import { AccountModal } from '@/features/auth/account-modal';
import { KodaSpacing } from '@/constants/koda-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export function KodaAccessGate({ isChecking, isUnavailable }: { isChecking: boolean; isUnavailable: boolean }) {
  const { theme } = useKodaTheme();

  if (isChecking) return <KodaLoadingScreen />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.brand}>
        <Image accessibilityLabel="Logotipo de KODA" source={require('@/assets/images/koda-mark.png')} style={styles.mark} />
        <Text style={[styles.name, { color: theme.text }]}>KODA</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>Tu semana de exámenes, en orden.</Text>
      </View>
      {isUnavailable ? (
        <Text style={[styles.unavailable, { color: theme.textSecondary }]}>El acceso a cuentas todavía se está preparando. Reintenta en unos minutos.</Text>
      ) : null}
      {!isUnavailable ? <AccountModal onClose={() => undefined} required /> : null}
    </View>
  );
}

export function KodaLoadingScreen({ label = 'Preparando tu espacio de estudio…' }: { label?: string }) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const [rotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reducedMotion) {
      rotation.stopAnimation();
      rotation.setValue(0);
      return undefined;
    }

    const animation = Animated.loop(Animated.timing(rotation, {
      toValue: 1,
      duration: 900,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }));
    animation.start();
    return () => animation.stop();
  }, [reducedMotion, rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View accessibilityLabel={label} style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <Animated.Image
        accessibilityLabel="KODA está cargando"
        source={require('@/assets/images/koda-mark.png')}
        style={[styles.loadingMark, { transform: [{ rotate: spin }] }]}
      />
      <Text style={[styles.loadingTitle, { color: theme.text }]}>KODA</Text>
      <Text style={[styles.loadingLabel, { color: theme.textSecondary }]}>{label}</Text>
      {reducedMotion ? <ActivityIndicator accessibilityLabel="Cargando" color={theme.accent} /> : null}
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
  loadingContainer: { alignItems: 'center', flex: 1, gap: KodaSpacing.md, justifyContent: 'center', padding: KodaSpacing.xl },
  loadingMark: { height: 76, width: 76 },
  loadingTitle: { fontSize: 23, fontWeight: '900', letterSpacing: 3, marginTop: KodaSpacing.sm },
  loadingLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
