import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { KodaRadius, KodaShadow, KodaSpacing } from '@/constants/koda-theme';
import { useKodaTheme } from '@/providers/koda-theme-provider';

type IconName = keyof typeof Ionicons.glyphMap;
type ButtonVariant = 'primary' | 'secondary' | 'quiet';

function giveFeedback() {
  void Haptics.selectionAsync().catch(() => undefined);
}

export function KodaScreen({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useKodaTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.screenContent,
          { paddingBottom: insets.bottom + 106 },
          contentStyle,
        ]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function KodaCard({
  children,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { theme } = useKodaTheme();

  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        KodaShadow,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function KodaPageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const { theme } = useKodaTheme();

  return (
    <View style={styles.pageHeader}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: theme.accent }]}>{eyebrow}</Text> : null}
        <Text style={[styles.pageTitle, { color: theme.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function KodaSectionTitle({
  title,
  action,
  onActionPress,
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
}) {
  const { theme } = useKodaTheme();

  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionHeading, { color: theme.text }]}>{title}</Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={() => {
            giveFeedback();
            onActionPress?.();
          }}
          hitSlop={10}>
          <Text style={[styles.sectionAction, { color: theme.accent }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function KodaButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const { theme } = useKodaTheme();
  const buttonTheme = {
    primary: {
      backgroundColor: theme.accent,
      color: theme.onAccent,
      borderColor: theme.accent,
    },
    secondary: {
      backgroundColor: theme.surfaceMuted,
      color: theme.text,
      borderColor: theme.border,
    },
    quiet: {
      backgroundColor: 'transparent',
      color: theme.accent,
      borderColor: 'transparent',
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        giveFeedback();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        buttonTheme,
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon ? <Ionicons color={buttonTheme.color} name={icon} size={18} /> : null}
      <Text style={[styles.buttonLabel, { color: buttonTheme.color }]}>{label}</Text>
    </Pressable>
  );
}

export function KodaIconButton({
  icon,
  label,
  onPress,
  style,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useKodaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        giveFeedback();
        onPress?.();
      }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
        pressed && styles.pressed,
      ]}>
      <Ionicons color={theme.text} name={icon} size={19} />
    </Pressable>
  );
}

export function KodaPill({
  label,
  selected = false,
  onPress,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useKodaTheme();
  const content = (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: selected ? theme.accent : theme.surfaceMuted,
          borderColor: selected ? theme.accent : theme.border,
        },
        style,
      ]}>
      <Text style={[styles.pillLabel, { color: selected ? theme.onAccent : theme.textSecondary }]}>{label}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={() => {
        giveFeedback();
        onPress();
      }}
      style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

export function KodaProgressBar({
  progress,
  color,
  height = 8,
}: {
  progress: number;
  color: string;
  height?: number;
}) {
  const { theme } = useKodaTheme();
  const percentage = Math.max(0, Math.min(100, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      style={[styles.progressTrack, { height, backgroundColor: theme.surfaceSubtle }]}>
      <View
        style={[
          styles.progressValue,
          { width: percentage + '%' as `${number}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export function KodaAvatar({ initials, size = 42 }: { initials: string; size?: number }) {
  const { theme } = useKodaTheme();

  return (
    <View
      accessibilityLabel={'Perfil de ' + initials}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.accentSoft,
        },
      ]}>
      <Text style={[styles.avatarLabel, { color: theme.accent }]}>{initials}</Text>
    </View>
  );
}

export function KodaText({
  children,
  style,
  tone = 'primary',
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  tone?: 'primary' | 'secondary' | 'tertiary';
  numberOfLines?: number;
}) {
  const { theme } = useKodaTheme();
  const color = {
    primary: theme.text,
    secondary: theme.textSecondary,
    tertiary: theme.textTertiary,
  }[tone];

  return (
    <Text numberOfLines={numberOfLines} style={[styles.bodyText, { color }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContent: {
    gap: KodaSpacing.xl,
    paddingHorizontal: KodaSpacing.xl,
    paddingTop: KodaSpacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: KodaRadius.lg,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: KodaSpacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: KodaSpacing.xs,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1.1,
    lineHeight: 38,
  },
  pageSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  sectionTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '800',
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    borderRadius: KodaRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: KodaSpacing.sm,
    justifyContent: 'center',
    paddingHorizontal: KodaSpacing.lg,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: KodaRadius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.45,
  },
  pill: {
    alignItems: 'center',
    borderRadius: KodaRadius.pill,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: KodaSpacing.md,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    borderRadius: KodaRadius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  progressValue: {
    borderRadius: KodaRadius.pill,
    height: '100%',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '900',
  },
  bodyText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
});
