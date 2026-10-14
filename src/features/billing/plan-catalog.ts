export type KodaPlan = {
  id: 'free' | 'plus';
  name: string;
  priceLabel: string;
  summary: string;
  highlights: string[];
};

// Catálogo visible de la propuesta comercial. No representa una suscripción
// activa ni habilita pagos hasta que exista un proveedor y la validación legal.
export const kodaPlans: KodaPlan[] = [
  {
    id: 'free',
    name: 'KODA Gratis',
    priceLabel: 'S/ 0',
    summary: 'Planificación, repasos y estudio desde tus propios materiales.',
    highlights: [
      'Plan inteligente y recordatorios',
      'Chat IA para dudas de estudio',
      'Hasta 3 PDFs y 5 audios analizados al día',
    ],
  },
  {
    id: 'plus',
    name: 'KODA Plus',
    priceLabel: 'S/ 9.90 / mes',
    summary: 'Propuesta para estudiantes que quieren análisis y seguimiento avanzado.',
    highlights: [
      'Analítica de preparación por curso',
      'Más capacidad de análisis de materiales',
      'Simulacros y reportes de progreso avanzados',
    ],
  },
];
