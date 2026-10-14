import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useKodaTheme } from '@/providers/koda-theme-provider';

type FeedbackTone = 'success' | 'danger' | 'info';

type DialogOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type NoticeOptions = {
  title: string;
  message?: string;
  tone?: FeedbackTone;
};

type DialogState = DialogOptions & { resolve: (confirmed: boolean) => void };
type NoticeState = NoticeOptions & { tone: FeedbackTone };

type KodaFeedbackContextValue = {
  confirm: (options: DialogOptions) => Promise<boolean>;
  showNotice: (options: NoticeOptions) => void;
};

const KodaFeedbackContext = createContext<KodaFeedbackContextValue | null>(null);

export function KodaFeedbackProvider({ children }: { children: ReactNode }) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [noticeOpacity] = useState(() => new Animated.Value(0));
  const [noticeOffset] = useState(() => new Animated.Value(-10));

  const confirm = useCallback((options: DialogOptions) => new Promise<boolean>((resolve) => {
    setDialog({
      confirmLabel: options.confirmLabel ?? 'Continuar',
      cancelLabel: options.cancelLabel ?? 'Cancelar',
      destructive: options.destructive ?? false,
      ...options,
      resolve,
    });
  }), []);

  const closeDialog = useCallback((confirmed: boolean) => {
    setDialog((current) => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);

  const showNotice = useCallback((options: NoticeOptions) => {
    setNotice({ tone: options.tone ?? 'success', ...options });
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    noticeOpacity.setValue(0);
    noticeOffset.setValue(reducedMotion ? 0 : -10);
    const enter = Animated.parallel([
      Animated.timing(noticeOpacity, { toValue: 1, duration: reducedMotion ? 120 : 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(noticeOffset, { toValue: 0, duration: reducedMotion ? 120 : 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    enter.start();
    const timeout = setTimeout(() => {
      Animated.timing(noticeOpacity, { toValue: 0, duration: reducedMotion ? 100 : 150, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => {
          if (finished) setNotice(null);
        });
    }, 3600);
    return () => {
      clearTimeout(timeout);
      enter.stop();
    };
  }, [notice, noticeOffset, noticeOpacity, reducedMotion]);

  const contextValue = { confirm, showNotice };
  const noticePalette = notice ? {
    success: { background: theme.successSoft, border: theme.success, icon: theme.success, name: 'checkmark-circle' as const },
    danger: { background: theme.warningSoft, border: theme.danger, icon: theme.danger, name: 'alert-circle' as const },
    info: { background: theme.accentSoft, border: theme.accent, icon: theme.accent, name: 'information-circle' as const },
  }[notice.tone] : null;

  return (
    <KodaFeedbackContext.Provider value={contextValue}>
      {children}
      {notice && noticePalette ? (
        <View pointerEvents="box-none" style={styles.noticeLayer}>
          <Animated.View accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor: noticePalette.background, borderColor: noticePalette.border, opacity: noticeOpacity, transform: [{ translateY: noticeOffset }] }]}>
            <Ionicons color={noticePalette.icon} name={noticePalette.name} size={20} />
            <View style={styles.noticeCopy}>
              <Text style={[styles.noticeTitle, { color: theme.text }]}>{notice.title}</Text>
              {notice.message ? <Text style={[styles.noticeMessage, { color: theme.textSecondary }]}>{notice.message}</Text> : null}
            </View>
            <Pressable accessibilityLabel="Cerrar aviso" hitSlop={8} onPress={() => setNotice(null)}>
              <Ionicons color={theme.textSecondary} name="close" size={19} />
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
      <Modal animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={() => closeDialog(false)} transparent visible={Boolean(dialog)}>
        <Pressable accessibilityLabel="Cerrar aviso" onPress={() => closeDialog(false)} style={[styles.overlay, { backgroundColor: theme.overlay + 'A6' }]}>
          <Pressable onPress={() => undefined} style={[styles.dialog, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.dialogIcon, { backgroundColor: dialog?.destructive ? theme.warningSoft : theme.accentSoft }]}>
              <Ionicons color={dialog?.destructive ? theme.danger : theme.accent} name={dialog?.destructive ? 'alert-circle-outline' : 'sparkles-outline'} size={22} />
            </View>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>{dialog?.title}</Text>
            <Text style={[styles.dialogMessage, { color: theme.textSecondary }]}>{dialog?.message}</Text>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => closeDialog(false)} style={({ pressed }) => [styles.action, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }, pressed && styles.pressed]}>
                <Text style={[styles.actionLabel, { color: theme.text }]}>{dialog?.cancelLabel}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => closeDialog(true)} style={({ pressed }) => [styles.action, { backgroundColor: dialog?.destructive ? theme.danger : theme.accent, borderColor: dialog?.destructive ? theme.danger : theme.accent }, pressed && styles.pressed]}>
                <Text style={[styles.actionLabel, { color: theme.onAccent }]}>{dialog?.confirmLabel}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KodaFeedbackContext.Provider>
  );
}

export function useKodaFeedback() {
  const context = useContext(KodaFeedbackContext);
  if (!context) throw new Error('useKodaFeedback debe usarse dentro de KodaFeedbackProvider.');
  return context;
}

const styles = StyleSheet.create({
  noticeLayer: { left: 0, paddingHorizontal: KodaSpacing.lg, position: 'absolute', right: 0, top: 58, zIndex: 100 },
  notice: { alignItems: 'flex-start', borderRadius: KodaRadius.md, borderWidth: 1, flexDirection: 'row', gap: KodaSpacing.sm, maxWidth: 560, padding: KodaSpacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 10 },
  noticeCopy: { flex: 1, gap: 2, minWidth: 0 },
  noticeTitle: { fontSize: 14, fontWeight: '900', lineHeight: 19 },
  noticeMessage: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  overlay: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: KodaSpacing.xl },
  dialog: { alignItems: 'flex-start', borderRadius: KodaRadius.lg, borderWidth: 1, gap: KodaSpacing.md, maxWidth: 460, padding: KodaSpacing.xl, width: '100%' },
  dialogIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 44, justifyContent: 'center', width: 44 },
  dialogTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.4, lineHeight: 26 },
  dialogMessage: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: KodaSpacing.sm, marginTop: KodaSpacing.sm, width: '100%' },
  action: { alignItems: 'center', borderRadius: KodaRadius.md, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: KodaSpacing.sm },
  actionLabel: { fontSize: 14, fontWeight: '900', textAlign: 'center' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
});
