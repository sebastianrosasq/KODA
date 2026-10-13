import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  getRegistrationInstitutions,
  getRegistrationPrograms,
  getSuggestedCourses,
} from '@/data/academic-catalog';
import { KodaButton, KodaPill } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { useKodaData } from '@/providers/koda-data-provider';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export function AcademicOnboardingModal() {
  const { theme } = useKodaTheme();
  const { completeAcademicProfile, workspace } = useKodaData();
  const institutions = useMemo(() => getRegistrationInstitutions(), []);
  const [displayName, setDisplayName] = useState(workspace.profile.displayName);
  const [institutionSlug, setInstitutionSlug] = useState(institutions[0]?.slug ?? '');
  const programs = useMemo(() => getRegistrationPrograms(institutionSlug), [institutionSlug]);
  const [programSlug, setProgramSlug] = useState(programs[0]?.slug ?? '');
  const selectedProgram = programs.find((program) => program.slug === programSlug) ?? programs[0];
  const [term, setTerm] = useState(1);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectInstitution = (slug: string) => {
    const nextPrograms = getRegistrationPrograms(slug);
    setInstitutionSlug(slug);
    setProgramSlug(nextPrograms[0]?.slug ?? '');
    setTerm(1);
    setMessage(null);
  };

  const completeSetup = async () => {
    const institution = institutions.find((item) => item.slug === institutionSlug);
    if (!institution || !selectedProgram) {
      setMessage('Elige una institución, carrera y ciclo para continuar.');
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const courses = await getSuggestedCourses(institution.slug, selectedProgram.slug, term);
      if (!courses.length) {
        setMessage('No encontramos cursos para ese ciclo. Prueba otro ciclo o vuelve a intentarlo.');
        return;
      }
      completeAcademicProfile({
        displayName: displayName.trim() || 'Estudiante',
        institutionSlug: institution.slug,
        institutionName: institution.name,
        programSlug: selectedProgram.slug,
        programName: selectedProgram.name,
        currentTerm: term,
      }, courses);
    } catch {
      setMessage('No se pudo cargar la malla. Revisa tu conexión e inténtalo nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={() => undefined} transparent visible>
      <View style={[styles.overlay, { backgroundColor: theme.overlay + 'B3' }]}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={[styles.icon, { backgroundColor: theme.accentSoft }]}>
              <Ionicons color={theme.accent} name="school-outline" size={24} />
            </View>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Prepara tu espacio de estudio</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Registra tu institución una sola vez. KODA cargará los cursos de tu malla y luego podrás añadir o quitar los que necesites.</Text>
            </View>

            <FieldLabel label="CÓMO TE LLAMAMOS" color={theme.textSecondary} />
            <TextInput
              accessibilityLabel="Nombre del estudiante"
              autoCapitalize="words"
              onChangeText={setDisplayName}
              placeholder="Tu nombre"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              value={displayName}
            />

            <FieldLabel label="INSTITUCIÓN" color={theme.textSecondary} />
            <View style={styles.pills}>
              {institutions.map((institution) => (
                <KodaPill key={institution.slug} label={institution.name} onPress={() => selectInstitution(institution.slug)} selected={institution.slug === institutionSlug} />
              ))}
            </View>

            <FieldLabel label="CARRERA" color={theme.textSecondary} />
            <View style={styles.pills}>
              {programs.map((program) => (
                <KodaPill key={program.slug} label={program.name} onPress={() => setProgramSlug(program.slug)} selected={program.slug === programSlug} />
              ))}
            </View>

            <FieldLabel label={selectedProgram?.termLabel?.toUpperCase() ?? 'CICLO'} color={theme.textSecondary} />
            <View style={styles.pills}>
              {Array.from({ length: selectedProgram?.termCount ?? 0 }, (_, index) => index + 1).map((number) => (
                <KodaPill key={number} label={String(number)} onPress={() => setTerm(number)} selected={number === term} />
              ))}
            </View>

            {message ? <Text style={[styles.message, { color: theme.danger }]}>{message}</Text> : null}
            {isSaving ? <ActivityIndicator color={theme.accent} /> : null}
            <KodaButton disabled={isSaving || !institutions.length} icon="sparkles-outline" label={isSaving ? 'Cargando tu malla…' : 'Crear mi espacio'} onPress={() => void completeSetup()} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FieldLabel({ color, label }: { color: string; label: string }) {
  return <Text style={[styles.label, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: KodaSpacing.md },
  card: { borderRadius: KodaRadius.lg, borderWidth: 1, maxHeight: '92%', maxWidth: 560, padding: KodaSpacing.xl, width: '100%' },
  content: { gap: KodaSpacing.lg },
  icon: { alignItems: 'center', borderRadius: KodaRadius.md, height: 48, justifyContent: 'center', width: 48 },
  title: { fontSize: 23, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { fontSize: 13, fontWeight: '600', lineHeight: 19, marginTop: 4 },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  input: { borderRadius: KodaRadius.md, borderWidth: 1, fontSize: 16, minHeight: 50, paddingHorizontal: KodaSpacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: KodaSpacing.sm },
  message: { fontSize: 12, fontWeight: '700', lineHeight: 17 },
});
