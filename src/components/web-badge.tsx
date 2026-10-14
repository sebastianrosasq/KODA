import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

export function WebBadge() {
  return (
    <ThemedView style={styles.container}>
      <Image
        accessibilityLabel="Logotipo de KODA"
        source={require('@/assets/images/koda-mark.png')}
        style={styles.mark}
      />
      <ThemedText type="code" themeColor="textSecondary" style={styles.wordmark}>
        KODA
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  wordmark: {
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  mark: {
    height: 36,
    width: 36,
  },
});
