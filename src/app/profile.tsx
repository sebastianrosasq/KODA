import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { getCatalogProgram, getProgramsForInstitution, getSuggestedCourses } from '@/data/academic-catalog';
import { KodaReveal } from '@/components/koda-reveal';
import { AccountModal } from '@/features/auth/account-modal';
import {
  KodaAvatar,
  KodaButton,
  KodaCard,
  KodaIconButton,
  KodaPageHeader,
  KodaPill,
  KodaScreen,
  KodaSectionTitle,
} from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { getStudyReminderStatus, scheduleStudyReminders, type StudyReminderStatus } from '@/features/reminders/study-reminders';
import { deleteKodaAccount, exportKodaPersonalData } from '@/features/privacy/account-privacy';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useKodaAuth } from '@/providers/koda-auth-provider';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function ProfileScreen() {
  const { colorScheme, theme, toggleColorScheme } = useKodaTheme();
  const { workspace, addCourse, clearLocalWorkspace, removeCourse, setCourseActive, syncError, syncState } = useKodaData();
  const { isConfigured, session, status, signOut } = useKodaAuth();
  const [isAcademicModalVisible, setAcademicModalVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [reminderStatus, setReminderStatus] = useState<StudyReminderStatus | null>(null);
  const [isSchedulingReminders, setSchedulingReminders] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
  const [isExportingData, setExportingData] = useState(false);
  const [isDeletingAccount, setDeletingAccount] = useState(false);
  const isDark = colorScheme === 'dark';
  const termLabel = getCatalogProgram(workspace.profile.institutionSlug, workspace.profile.programSlug)?.termLabel ?? 'Ciclo';

  const refreshReminderStatus = useCallback(async () => {
    try {
      const nextStatus = await getStudyReminderStatus();
      setReminderStatus(nextStatus);
      setReminderMessage(null);
    } catch {
      setReminderMessage('No se pudo revisar el estado de los avisos en este dispositivo.');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void refreshReminderStatus(), 0);
    return () => clearTimeout(timer);
  }, [refreshReminderStatus]);

  const submitCourse = () => {
    addCourse(newCourseName);
    setNewCourseName('');
  };

  const updateReminders = async () => {
    if (!workspace.availability.length) {
      setReminderMessage('Primero añade al menos un bloque en tu plan. Así KODA sabrá cuándo avisarte.');
      router.push('/plan');
      return;
    }
    setSchedulingReminders(true);
    try {
      const result = await scheduleStudyReminders(workspace.availability);
      setReminderMessage(result.status === 'scheduled'
        ? `${result.count} recordatorios semanales actualizados.`
        : result.message);
      await refreshReminderStatus();
    } catch {
      setReminderMessage('No se pudieron actualizar los recordatorios en este dispositivo.');
    } finally {
      setSchedulingReminders(false);
    }
  };

  const exportPersonalData = async () => {
    setExportingData(true);
    setPrivacyMessage(null);
    try {
      setPrivacyMessage(await exportKodaPersonalData());
    } catch (error) {
      setPrivacyMessage(error instanceof Error ? error.message : 'No se pudo exportar tus datos.');
    } finally {
      setExportingData(false);
    }
  };

  const deleteAccount = async () => {
    setDeletingAccount(true);
    setPrivacyMessage(null);
    try {
      await deleteKodaAccount();
      await clearLocalWorkspace();
      await signOut();
    } catch (error) {
      setPrivacyMessage(error instanceof Error ? error.message : 'No se pudo eliminar tu cuenta.');
      setDeletingAccount(false);
    }
  };

  const confirmAccountDeletion = () => {
    Alert.alert(
      '¿Eliminar tu cuenta?',
      'Se borrarán de forma definitiva tus cursos, plan, flashcards, resultados, historial de IA y materiales privados. Guarda antes cualquier PDF o audio que quieras conservar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => Alert.alert(
            'Última confirmación',
            'Esta acción no se puede deshacer.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Eliminar definitivamente', style: 'destructive', onPress: () => void deleteAccount() },
            ],
          ),
        },
      ],
    );
  };

  return (
    <KodaScreen>
      <KodaReveal>
        <KodaPageHeader
          eyebrow="Tu espacio"
          title="Perfil"
          subtitle="Tu institución queda protegida; ajusta tu carrera, ciclo y cursos cuando lo necesites."
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
          <KodaIconButton icon="create-outline" label="Editar carrera y ciclo" onPress={() => setAcademicModalVisible(true)} />
        </KodaCard>
      </KodaReveal>

      <KodaReveal delay={90} style={styles.sectionBlock}>
        <KodaSectionTitle title="Tus cursos" action="Editar carrera y ciclo" onActionPress={() => setAcademicModalVisible(true)} />
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
                  : 'Tu planificación se conserva en este dispositivo hasta que inicies sesión.'}
            </Text>
          </View>
          <KodaButton
            label={status === 'signed_in' ? 'Cerrar sesión' : isConfigured ? 'Acceder' : 'Ver estado'}
            onPress={status === 'signed_in' ? () => void signOut() : () => setAccountModalVisible(true)}
            style={styles.accountButton}
            variant={status === 'signed_in' ? 'secondary' : 'primary'}
          />
        </KodaCard>
        {status === 'signed_in' ? (
          <Text style={[styles.syncText, { color: syncState === 'error' ? theme.warning : theme.textTertiary }]}>
            {syncState === 'synced' ? 'Tus cambios están sincronizados.' : syncState === 'syncing' ? 'Sincronizando tus cambios…' : syncError ?? 'Los cambios se guardan en este dispositivo.'}
          </Text>
        ) : null}
      </KodaReveal>

      <KodaReveal delay={225} style={styles.sectionBlock}>
        <KodaSectionTitle title="Recordatorios" />
        <KodaCard style={styles.reminderCard}>
          <View style={[styles.preferenceIcon, { backgroundColor: theme.accentSoft }]}>
            <Ionicons color={theme.accent} name="notifications-outline" size={19} />
          </View>
          <View style={styles.preferenceCopy}>
            <Text style={[styles.preferenceTitle, { color: theme.text }]}>Aviso 15 minutos antes</Text>
            <Text style={[styles.preferenceText, { color: theme.textSecondary }]}>{reminderStatus?.message ?? 'Revisando los avisos de tu plan actual…'}</Text>
          </View>
          <KodaButton
            disabled={isSchedulingReminders || reminderStatus?.status === 'unavailable'}
            label={isSchedulingReminders ? 'Actualizando…' : reminderStatus?.status === 'active' ? 'Actualizar' : reminderStatus?.status === 'unavailable' ? 'En teléfono' : workspace.availability.length ? 'Activar' : 'Configurar'}
            onPress={() => void updateReminders()}
          />
        </KodaCard>
        {reminderMessage ? <Text style={[styles.syncText, { color: theme.textSecondary }]}>{reminderMessage}</Text> : null}
      </KodaReveal>

      {status === 'signed_in' ? (
        <KodaReveal delay={270} style={styles.sectionBlock}>
          <KodaSectionTitle title="Tus datos" />
          <KodaCard style={styles.privacyCard}>
            <View style={[styles.preferenceIcon, { backgroundColor: theme.accentSoft }]}>
              <Ionicons color={theme.accent} name="shield-checkmark-outline" size={19} />
            </View>
            <View style={styles.privacyCopy}>
              <Text style={[styles.preferenceTitle, { color: theme.text }]}>Descargar mis datos</Text>
              <Text style={[styles.preferenceText, { color: theme.textSecondary }]}>Guarda un archivo JSON con tu perfil, plan, repaso, resultados e historial de IA. Tus PDF o audios originales no se adjuntan.</Text>
            </View>
            <KodaButton
              disabled={isExportingData || isDeletingAccount}
              icon="download-outline"
              label={isExportingData ? 'Preparando…' : 'Exportar'}
              onPress={() => void exportPersonalData()}
              variant="secondary"
            />
          </KodaCard>
          <KodaCard style={[styles.privacyCard, { borderColor: theme.danger }]}>
            <View style={[styles.preferenceIcon, { backgroundColor: theme.warningSoft }]}>
              <Ionicons color={theme.danger} name="trash-outline" size={19} />
            </View>
            <View style={styles.privacyCopy}>
              <Text style={[styles.preferenceTitle, { color: theme.text }]}>Eliminar mi cuenta</Text>
              <Text style={[styles.preferenceText, { color: theme.textSecondary }]}>Borra la cuenta y todos sus datos de KODA. Te pediremos dos confirmaciones antes de continuar.</Text>
            </View>
            <KodaButton
              disabled={isDeletingAccount || isExportingData}
              label={isDeletingAccount ? 'Eliminando…' : 'Eliminar'}
              onPress={confirmAccountDeletion}
              style={[styles.deleteButton, { backgroundColor: theme.warningSoft, borderColor: theme.danger }]}
              variant="secondary"
            />
          </KodaCard>
          {privacyMessage ? <Text style={[styles.syncText, { color: theme.textSecondary }]}>{privacyMessage}</Text> : null}
        </KodaReveal>
      ) : null}

      {isAcademicModalVisible ? <AcademicProfileModal onClose={() => setAcademicModalVisible(false)} /> : null}
      {isAccountModalVisible ? <AccountModal onClose={() => setAccountModalVisible(false)} /> : null}
    </KodaScreen>
  );
}

function AcademicProfileModal({ onClose }: { onClose: () => void }) {
  const { theme } = useKodaTheme();
  const reducedMotion = useReducedMotion();
  const { workspace, preloadCourses, updateProfile } = useKodaData();
  const institutionSlug = workspace.profile.institutionSlug;
  const programs = useMemo(() => getProgramsForInstitution(institutionSlug), [institutionSlug]);
  const [programSlug, setProgramSlug] = useState(workspace.profile.programSlug);
  const selectedProgram = programs.find((program) => program.slug === programSlug) ?? programs[0];
  const [term, setTerm] = useState(workspace.profile.currentTerm);
  const [isSaving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!selectedProgram) return;
    setSaving(true);
    try {
      updateProfile({
        ...workspace.profile,
        programSlug: selectedProgram.slug,
        programName: selectedProgram.name,
        currentTerm: term,
      });
      const suggestedCourses = await getSuggestedCourses(institutionSlug, selectedProgram.slug, term);
      preloadCourses(suggestedCourses);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={onClose} transparent visible>
      <Pressable accessibilityLabel="Cerrar edición académica" onPress={onClose} style={[styles.modalOverlay, { backgroundColor: theme.overlay + '99' }]}>
        <Pressable onPress={() => undefined} style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Perfil académico</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Tu institución fue elegida durante el registro y no se modifica aquí.</Text>
              </View>
              <KodaIconButton icon="close" label="Cerrar" onPress={onClose} />
            </View>
            <View style={[styles.institutionLock, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
              <Ionicons color={theme.accent} name="lock-closed-outline" size={17} />
              <View style={styles.institutionLockCopy}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>INSTITUCIÓN REGISTRADA</Text>
                <Text style={[styles.institutionLockName, { color: theme.text }]}>{workspace.profile.institutionName}</Text>
              </View>
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
  syncText: { fontSize: 12, fontWeight: '600', lineHeight: 17, paddingHorizontal: KodaSpacing.sm },
  reminderCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  privacyCard: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.md, padding: KodaSpacing.lg },
  privacyCopy: { flex: 1, gap: 2 },
  deleteButton: { minWidth: 104 },
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
  institutionLock: { alignItems: 'center', borderRadius: KodaRadius.md, borderWidth: 1, flexDirection: 'row', gap: KodaSpacing.sm, padding: KodaSpacing.md },
  institutionLockCopy: { flex: 1, gap: 3 },
  institutionLockName: { fontSize: 14, fontWeight: '800' },
  authInput: { borderRadius: KodaRadius.md, borderWidth: 1, fontSize: 16, minHeight: 50, paddingHorizontal: KodaSpacing.md },
  accountMessage: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
