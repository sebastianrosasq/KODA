import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { student } from '@/data/demo-data';
import {
  KodaAvatar,
  KodaCard,
  KodaPageHeader,
  KodaScreen,
  KodaSectionTitle,
  KodaText,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function ProfileScreen() {
  const { colorScheme, theme, toggleColorScheme } = useKodaTheme();
  const isDark = colorScheme === 'dark';

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="Tu espacio"
        title="Perfil"
        subtitle="Personaliza cómo KODA te acompaña durante la semana."
      />

      <KodaCard style={styles.profileCard}>
        <KodaAvatar initials="SR" size={58} />
        <View style={styles.profileCopy}>
          <Text style={[styles.name, { color: theme.text }]}>{student.name + ' Rosas'}</Text>
          <Text style={[styles.institution, { color: theme.textSecondary }]}>{student.institution}</Text>
          <Text style={[styles.career, { color: theme.textTertiary }]}>{student.career + ' · ' + student.cycle}</Text>
        </View>
      </KodaCard>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Preferencias" />
        <KodaCard style={styles.preferenceCard}>
          <View style={[styles.preferenceIcon, { backgroundColor: theme.accentSoft }]}>
            <Ionicons color={theme.accent} name={isDark ? 'moon' : 'sunny-outline'} size={19} />
          </View>
          <View style={styles.preferenceCopy}>
            <Text style={[styles.preferenceTitle, { color: theme.text }]}>Modo oscuro</Text>
            <Text style={[styles.preferenceText, { color: theme.textSecondary }]}>
              {isDark ? 'Activo para estudiar con menos brillo.' : 'Usa una superficie clara y suave.'}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Cambiar modo oscuro"
            onValueChange={toggleColorScheme}
            thumbColor={isDark ? theme.accentStrong : theme.surface}
            trackColor={{ false: theme.surfaceSubtle, true: theme.accent }}
            value={isDark}
          />
        </KodaCard>

        <KodaCard style={styles.preferenceCard}>
          <View style={[styles.preferenceIcon, { backgroundColor: theme.successSoft }]}>
            <Ionicons color={theme.success} name="notifications-outline" size={19} />
          </View>
          <View style={styles.preferenceCopy}>
            <Text style={[styles.preferenceTitle, { color: theme.text }]}>Recordatorios</Text>
            <Text style={[styles.preferenceText, { color: theme.textSecondary }]}>
              Se activarán cuando configuremos notificaciones en el Sprint 5.
            </Text>
          </View>
          <Ionicons color={theme.textTertiary} name="chevron-forward" size={18} />
        </KodaCard>
      </View>

      <View style={styles.sectionBlock}>
        <KodaSectionTitle title="Estado de tu cuenta" />
        <KodaCard style={styles.accountCard}>
          <View style={styles.accountRow}>
            <KodaText tone="secondary">Datos mostrados</KodaText>
            <Text style={[styles.accountValue, { color: theme.text }]}>Demostración local</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          <View style={styles.accountRow}>
            <KodaText tone="secondary">Inicio de sesión</KodaText>
            <Text style={[styles.accountValue, { color: theme.text }]}>Sprint 2</Text>
          </View>
        </KodaCard>
      </View>

      <KodaCard style={[styles.privacyCard, { backgroundColor: theme.surfaceMuted }]}>
        <Ionicons color={theme.textSecondary} name="shield-checkmark-outline" size={20} />
        <KodaText tone="secondary" style={styles.privacyText}>
          Tus cursos y datos personales se guardarán con controles de acceso por estudiante.
        </KodaText>
      </KodaCard>
    </KodaScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.lg,
    padding: KodaSpacing.xl,
  },
  profileCopy: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  institution: {
    fontSize: 13,
    fontWeight: '800',
  },
  career: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionBlock: {
    gap: KodaSpacing.md,
  },
  preferenceCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  preferenceIcon: {
    alignItems: 'center',
    borderRadius: KodaRadius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  preferenceCopy: {
    flex: 1,
    gap: 2,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  preferenceText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  accountCard: {
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  accountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    width: '100%',
  },
  privacyCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: KodaSpacing.md,
    padding: KodaSpacing.lg,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
