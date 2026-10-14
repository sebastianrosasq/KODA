import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { KodaButton, KodaCard, KodaIconButton, KodaPageHeader, KodaScreen } from '@/components/koda-ui';
import { KodaRadius, KodaSpacing } from '@/constants/koda-theme';
import { kodaPlans } from '@/features/billing/plan-catalog';
import { useKodaTheme } from '@/providers/koda-theme-provider';

export default function MembershipScreen() {
  const { theme } = useKodaTheme();
  const [isPlusModalVisible, setPlusModalVisible] = useState(false);

  return (
    <KodaScreen>
      <KodaPageHeader
        eyebrow="KODA Plus"
        title="Una propuesta clara"
        subtitle="Los planes se muestran para que conozcas qué se desbloquearía. Aún no se realizan cobros ni se guardan medios de pago."
        right={<KodaIconButton icon="chevron-back" label="Volver al perfil" onPress={() => router.back()} />}
      />

      <KodaCard style={[styles.notice, { backgroundColor: theme.accentSoft, borderColor: theme.accentSoft }]}>
        <Text style={[styles.noticeTitle, { color: theme.text }]}>Tu estudio actual no cambia</Text>
        <Text style={[styles.noticeText, { color: theme.textSecondary }]}>KODA seguirá ofreciendo planificación, repaso y el chat de estudio. La versión gratuita considerará anuncios breves y no invasivos; KODA Plus será sin anuncios. La suscripción se activará solo cuando la pasarela de pagos, los términos y los controles de privacidad estén listos.</Text>
      </KodaCard>

      {kodaPlans.map((plan) => (
        <KodaCard key={plan.id} style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planCopy}>
              <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
              <Text style={[styles.planSummary, { color: theme.textSecondary }]}>{plan.summary}</Text>
            </View>
            <Text style={[styles.price, { color: plan.id === 'plus' ? theme.accent : theme.text }]}>{plan.priceLabel}</Text>
          </View>
          <View style={styles.highlights}>
            {plan.highlights.map((highlight) => (
              <View key={highlight} style={styles.highlight}>
                <View style={[styles.dot, { backgroundColor: theme.accent }]} />
                <Text style={[styles.highlightText, { color: theme.textSecondary }]}>{highlight}</Text>
              </View>
            ))}
          </View>
          {plan.id === 'plus' ? <KodaButton icon="sparkles-outline" label="Quiero KODA Plus" onPress={() => setPlusModalVisible(true)} variant="secondary" /> : null}
        </KodaCard>
      ))}

      <Modal animationType="fade" onRequestClose={() => setPlusModalVisible(false)} transparent visible={isPlusModalVisible}>
        <Pressable accessibilityLabel="Cerrar información de KODA Plus" onPress={() => setPlusModalVisible(false)} style={[styles.modalOverlay, { backgroundColor: theme.overlay + '99' }]}>
          <Pressable onPress={() => undefined} style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalEyebrow, { color: theme.accent }]}>KODA PLUS</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Próximamente</Text>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>La propuesta es S/ 9.90 al mes e incluiría más análisis, simulacros, seguimiento avanzado y una experiencia sin anuncios. Aún no hay cobros, tarjetas ni suscripciones activas.</Text>
            <KodaButton label="Entendido" onPress={() => setPlusModalVisible(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </KodaScreen>
  );
}

const styles = StyleSheet.create({
  notice: { gap: KodaSpacing.sm, padding: KodaSpacing.lg },
  noticeTitle: { fontSize: 16, fontWeight: '900' },
  noticeText: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  planCard: { gap: KodaSpacing.lg, padding: KodaSpacing.xl },
  planHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: KodaSpacing.md, justifyContent: 'space-between' },
  planCopy: { flex: 1, gap: 4, minWidth: 0 },
  planName: { fontSize: 20, fontWeight: '900' },
  planSummary: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  price: { fontSize: 14, fontWeight: '900', textAlign: 'right' },
  highlights: { gap: KodaSpacing.sm },
  highlight: { alignItems: 'center', flexDirection: 'row', gap: KodaSpacing.sm },
  dot: { borderRadius: KodaRadius.pill, height: 6, width: 6 },
  highlightText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 19, minWidth: 0 },
  modalOverlay: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: KodaSpacing.xl },
  modalCard: { borderRadius: KodaRadius.lg, borderWidth: 1, gap: KodaSpacing.md, maxWidth: 440, padding: KodaSpacing.xl, width: '100%' },
  modalEyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  modalTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  modalText: { fontSize: 14, fontWeight: '600', lineHeight: 21 },
});
