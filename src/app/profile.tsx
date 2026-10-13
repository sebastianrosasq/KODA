import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { catalogInstitutions, getCatalogProgram, getProgramsForInstitution, getSuggestedCourses } from '@/data/academic-catalog';
import { KodaReveal } from '@/components/koda-reveal';
import {
  KodaAvatar,
  KodaButton,
  KodaCard,
  KodaIconButton,
  KodaPageHeader,
  KodaPill,
  KodaScreen,
  KodaSectionTitle,
  KodaText,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useKodaAuth } from '@/providers/koda-auth-provider';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function ProfileScreen() {
  const { colorScheme, theme, toggleColorScheme } = useKodaTheme();
  const { workspace, addCourse, removeCourse, setCourseActive } = useKodaData();
  const { isConfigured, session, status, signIn, signOut, signUp } = useKodaAuth();
  const [isAcademicModalVisible, setAcademicModalVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const isDark = colorScheme === 'dark';
  const termLabel = getCatalogProgram(workspace.profile.institutionSlug, workspace.profile.programSlug)?.termLabel ?? 'Ciclo';

  const submitCourse = () => {
    addCourse(newCourseName);
    setNewCourseName('');
  };

  return (
    <KodaScreen>
      <KodaReveal>
        <KodaPageHeader
          eyebrow="Tu espacio"
          title="Perfil"
          subtitle="Tu carrera es editable: KODA solo propone un punto de partida."
        />
      </KodaReveal>

      <KodaReveal delay={45}>
        <KodaCard style={styles.profileCard}>
          <KodaAvatar initials={workspace.profile.displayName.slice(0, 2).toUpperCase()} size={58} />
          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: theme.text }]}>{workspace.profile.displayName}</Text>
            <Text style={[styles.institution, { color: theme.textSecondary }]}>{workspace.profile.institutionName}</Text>
            <Text style={[styles.career, { color: theme.textTertiary }]}>
              {workspace.profile.programName} · {workspace.profile.currentTerm}.° {termLabel.toLocaleLowerCase()}
            </Text>
          </View>
          <KodaIconButton icon="create-outline" label="Editar perfil académico" onPress={() => setAcademicModalVisible(true)} />
        </KodaCard>
      </KodaReveal>

      <KodaReveal delay={90} style={styles.sectionBlock}>
        <KodaSectionTitle title="Tus cursos" action="Editar perfil" onActionPress={() => setAcademicModalVisible(true)} />
        {workspace.courses.map((course) => (
          <KodaCard key={course.id} style={styles.courseCard}>
            <View style={[styles.courseDot, { backgroundColor: getToneColor(course.tone, theme) }]} />
            <View style={styles.courseCopy}>
              <Text style={[styles.courseName, { color: theme.text }]}>{course.name}</Text>
              <Text style={[styles.courseMeta, { color: theme.textTertiary }]}>
                {course.wasPreloaded ? 'Sugerido por tu malla' : 'Agregado por ti'}
              </Text>
            </View>
            <Switch
              accessibilityLabel={`Incluir ${course.name} en tu plan`}
              onValueChange={(value) => setCourseActive(course.id, value)}
              thumbColor={course.isActive ? theme.accentStrong : theme.surface}
              trackColor={{ false: theme.surfaceSubtle, true: theme.accentSoft }}
              value={course.isActive}
            />
            <KodaIconButton icon="close-outline" label={`Quitar ${course.name}`} onPress={() => removeCourse(course.id)} />
          </KodaCard>
        ))}
        <KodaCard style={styles.addCourseCard}>
          <TextInput
            accessibilityLabel="Nombre del nuevo curso"
            onChangeText={setNewCourseName}
            onSubmitEditing={submitCourse}
            placeholder="Añadir un curso propio"
            placeholderTextColor={theme.textTertiary}
            returnKeyType="done"
            style={[styles.courseInput, { color: theme.text }]}
            value={newCourseName}
          />
          <KodaIconButton icon="add" label="Añadir curso" onPress={submitCourse} />
        </KodaCard>
      </KodaReveal>

      <KodaReveal delay={135} style={styles.sectionBlock}>
        <KodaSectionTitle title="Preferencias" />
        <KodaCard style={styles.preferenceCard}>
          <View style={[styles.preferenceIcon, { backgroundColor: theme.accentSoft }]}>
            <Ionicons color={theme.accent} name={isDark ? 'moon' : 'sunny-outline'} size={19} />
          </View>
          <View style={styles.preferenceCopy}>
            <Text style={[styles.preferenceTitle, { color: theme.text }]}>Modo oscuro</Text>
            <Text style={[styles.preferenceText, { color: theme.textSecondary }]}>
              {isDark ? 'Activo para estudiar con menos brillo.' : 'Superficie clara, cálida y de bajo contraste.'}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Cambiar modo oscuro"
            onValueChange={toggleColorScheme}
            thumbColor={isDark ? theme.accentStrong : theme.surface}
            trackColor={{ false: theme.surfaceSubtle, true: theme.accentSoft }}
            value={isDark}
          />
        </KodaCard>
      </KodaReveal>

      <KodaReveal delay={180} style={styles.sectionBlock}>
        <KodaSectionTitle title="Cuenta y privacidad" />
        <KodaCard style={styles.accountCard}>
          <View style={styles.accountCopy}>
            <Text style={[styles.preferenceTitle, { color: theme.text }]}>
              {status === 'signed_in' ? 'Sesión iniciada' : isConfigured ? 'Cuenta KODA' : 'Modo local protegido'}
            </Text>
            <Text style={[styles.preferenceText, { color: theme.textSecondary }]}>
              {status === 'signed_in'
                ? session?.user.email
                : isConfigured
                  ? 'Crea una cuenta para sincronizar tus cursos en varios dispositivos.'
                  : 'Tu planificación se conserva en este dispositivo hasta conectar Supabase.'}
            </Text>
          </View>
          <KodaButton
            label={status === 'signed_in' ? 'Cerrar sesión' : isConfigured ? 'Acceder' : 'Ver estado'}
            onPress={status === 'signed_in' ? () => void signOut() : () => setAccountModalVisible(true)}
            style={styles.accountButton}
            variant={status === 'signed_in' ? 'secondary' : 'primary'}
          />
        </KodaCard>
        <KodaCard style={[styles.privacyCard, { backgroundColor: theme.surfaceMuted }]}>
          <Ionicons color={theme.textSecondary} name="shield-checkmark-outline" size={20} />
          <KodaText tone="secondary" style={styles.privacyText}>
            La APK nunca guardará claves de IA ni permisos de administrador. La sincronización usará reglas por estudiante.
          </KodaText>
        </KodaCard>
      </KodaReveal>

      {isAcademicModalVisible ? <AcademicProfileModal onClose={() => setAcademicModalVisible(false)} /> : null}
      {isAccountModalVisible ? (
        <AccountModal
          isConfigured={isConfigured}
          onClose={() => setAccountModalVisible(false)}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      ) : null}
    </KodaScreen>
  );
}

function AcademicProfileModal({ onClose }: { onClose: () => void }) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const { workspace, preloadCourses, updateProfile } = useKodaData();
  const [institutionSlug, setInstitutionSlug] = useState(workspace.profile.institutionSlug);
  const programs = useMemo(() => getProgramsForInstitution(institutionSlug), [institutionSlug]);
  const [programSlug, setProgramSlug] = useState(workspace.profile.programSlug);
  const selectedProgram = programs.find((program) => program.slug === programSlug) ?? programs[0];
  const [term, setTerm] = useState(workspace.profile.currentTerm);
  const [isSaving, setSaving] = useState(false);

  const selectInstitution = (slug: string) => {
    const nextPrograms = getProgramsForInstitution(slug);
    setInstitutionSlug(slug);
    setProgramSlug(nextPrograms[0]?.slug ?? '');
    setTerm(1);
  };

  const saveProfile = async () => {
    const institution = catalogInstitutions.find((item) => item.slug === institutionSlug);
    if (!institution || !selectedProgram) return;
    setSaving(true);
    updateProfile({
      displayName: workspace.profile.displayName,
      institutionSlug,
      institutionName: institution.name,
      programSlug: selectedProgram.slug,
      programName: selectedProgram.name,
      currentTerm: term,
    });
    const suggestedCourses = await getSuggestedCourses(institutionSlug, selectedProgram.slug, term);
    preloadCourses(suggestedCourses);
    setSaving(false);
    onClose();
  };

  return (
    <Modal animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={onClose} transparent visible>
      <Pressable accessibilityLabel="Cerrar edición académica" onPress={onClose} style={[styles.modalOverlay, { backgroundColor: theme.overlay + '99' }]}>
        <Pressable onPress={() => undefined} style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Perfil académico</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Elige una base y conserva el control de tus cursos.</Text>
              </View>
              <KodaIconButton icon="close" label="Cerrar" onPress={onClose} />
            </View>
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>INSTITUCIÓN</Text>
            <View style={styles.pills}>
              {catalogInstitutions.map((institution) => (
                <KodaPill key={institution.slug} label={institution.name} onPress={() => selectInstitution(institution.slug)} selected={institution.slug === institutionSlug} />
              ))}
            </View>
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>CARRERA</Text>
            <View style={styles.pills}>
              {programs.map((program) => (
                <KodaPill key={program.slug} label={program.name} onPress={() => setProgramSlug(program.slug)} selected={program.slug === programSlug} />
              ))}
            </View>
            {selectedProgram?.status === 'source_identified' ? (
              <View style={[styles.catalogNotice, { backgroundColor: theme.warningSoft }]}>
                <Ionicons color={theme.warning} name="information-circle-outline" size={18} />
                <Text style={[styles.catalogNoticeText, { color: theme.textSecondary }]}>La fuente está identificada; activaremos la malla cuando termine su contraste oficial.</Text>
              </View>
            ) : null}
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>{selectedProgram?.termLabel ?? 'CICLO'}</Text>
            <View style={styles.pills}>
              {Array.from({ length: selectedProgram?.termCount ?? 0 }, (_, index) => index + 1).map((number) => (
                <KodaPill key={number} label={String(number)} onPress={() => setTerm(number)} selected={number === term} />
              ))}
            </View>
            <KodaButton disabled={isSaving} label={isSaving ? 'Consultando malla…' : 'Guardar y sugerir cursos'} icon="sparkles-outline" onPress={() => void saveProfile()} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AccountModal({
  isConfigured,
  onClose,
  onSignIn,
  onSignUp,
}: {
  isConfigured: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string) => Promise<string | null>;
}) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (mode: 'signIn' | 'signUp') => {
    setLoading(true);
    const result = mode === 'signIn' ? await onSignIn(email, password) : await onSignUp(email, password);
    setLoading(false);
    setMessage(result ?? (mode === 'signIn' ? 'Sesión iniciada.' : 'Cuenta creada.'));
  };

  return (
    <Modal animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={onClose} transparent visible>
      <Pressable accessibilityLabel="Cerrar acceso a cuenta" onPress={onClose} style={[styles.modalOverlay, { backgroundColor: theme.overlay + '99' }]}>
        <Pressable onPress={() => undefined} style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Tu cuenta KODA</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Sincroniza solo cuando el servidor seguro esté disponible.</Text>
            </View>
            <KodaIconButton icon="close" label="Cerrar" onPress={onClose} />
          </View>
          {!isConfigured ? (
            <View style={[styles.catalogNotice, { backgroundColor: theme.accentSoft }]}>
              <Ionicons color={theme.accent} name="cloud-offline-outline" size={19} />
              <Text style={[styles.catalogNoticeText, { color: theme.textSecondary }]}>Supabase aún no está vinculado. Tus datos siguen disponibles localmente en este dispositivo.</Text>
            </View>
          ) : (
            <>
              <TextInput
                accessibilityLabel="Correo electrónico"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={theme.textTertiary}
                style={[styles.authInput, { borderColor: theme.border, color: theme.text }]}
                value={email}
              />
              <TextInput
                accessibilityLabel="Contraseña"
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
                style={[styles.authInput, { borderColor: theme.border, color: theme.text }]}
                value={password}
              />
              {message ? <Text style={[styles.accountMessage, { color: theme.textSecondary }]}>{message}</Text> : null}
              {loading ? <ActivityIndicator color={theme.accent} /> : null}
              <KodaButton label="Iniciar sesión" disabled={loading} onPress={() => void submit('signIn')} />
              <KodaButton label="Crear cuenta" disabled={loading} onPress={() => void submit('signUp')} variant="secondary" />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getToneColor(tone: 'plum' | 'mint' | 'amber' | 'sky', theme: ReturnType<typeof useKodaTheme>['theme']) {
  return { plum: theme.accent, mint: theme.success, amber: theme.warning, sky: '#3284A6' }[tone];
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.lg, padding: KodaSpacing.xl },
  profileCopy: { flex: 1, gap: 3 },
  name: { fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  institution: { fontSize: 13, fontWeight: '800' },
  career: { fontSize: 12, fontWeight: '600' },
  sectionBlock: { gap: KodaSpacing.md },
  courseCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.md },
  courseDot: { borderRadius: KodaRadius.pill, height: 10, width: 10 },
  courseCopy: { flex: 1, gap: 2 },
  courseName: { fontSize: 14, fontWeight: '800' },
  courseMeta: { fontSize: 11, fontWeight: '600' },
  addCourseCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.sm },
  courseInput: { flex: 1, fontSize: 15, fontWeight: '600', minHeight: 44, paddingHorizontal: KodaSpacing.sm },
  preferenceCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  preferenceIcon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 42, justifyContent: 'center', width: 42 },
  preferenceCopy: { flex: 1, gap: 2 },
  preferenceTitle: { fontSize: 14, fontWeight: '900' },
  preferenceText: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  accountCard: { gap: KodaSpacing.lg, padding: KodaSpacing.lg },
  accountCopy: { gap: 3 },
  accountButton: { alignSelf: 'flex-start' },
  privacyCard: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  privacyText: { flex: 1, fontSize: 13, lineHeight: 19 },
  modalOverlay: { alignItems: 'center', flex: 1, justifyContent: 'flex-end', padding: KodaSpacing.md },
  modalCard: { borderRadius: KodaRadius.lg, borderWidth: 1, maxHeight: '90%', maxWidth: 560, padding: KodaSpacing.xl, width: '100%' },
  modalContent: { gap: KodaSpacing.lg },
  modalHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.md, justifyContent: 'space-between' },
  modalHeaderCopy: { flex: 1 },
  modalTitle: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5 },
  modalSubtitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 3 },
  modalLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: KodaSpacing.sm },
  catalogNotice: { alignItems: 'flex-start', borderRadius: KodaRadius.md, flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.md },
  catalogNoticeText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  authInput: { borderRadius: KodaRadius.md, borderWidth: 1, fontSize: 16, minHeight: 50, paddingHorizontal: KodaSpacing.md },
  accountMessage: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
