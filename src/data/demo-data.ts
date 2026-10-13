export type CourseTone = 'purple' | 'mint' | 'amber';

export type StudySession = {
  id: string;
  title: string;
  course: string;
  time: string;
  duration: string;
  completed?: boolean;
  tone: CourseTone;
};

export const student = {
  name: 'Sebastián',
  institution: 'TECSUP',
  career: 'Diseño y Desarrollo de Software',
  cycle: 'IV ciclo',
};

export const nextExam = {
  course: 'Arquitectura de Software',
  topic: 'Patrones y atributos de calidad',
  dateLabel: 'Jueves 16',
  remaining: '3 días',
  preparation: 62,
};

export const todaySessions: StudySession[] = [
  {
    id: 'architecture',
    title: 'Repaso de patrones',
    course: 'Arquitectura de Software',
    time: '18:30',
    duration: '45 min',
    completed: true,
    tone: 'purple',
  },
  {
    id: 'database',
    title: 'Ejercicios de normalización',
    course: 'Base de Datos',
    time: '20:00',
    duration: '50 min',
    tone: 'mint',
  },
  {
    id: 'english',
    title: 'Flashcards de vocabulario',
    course: 'Inglés técnico',
    time: '21:15',
    duration: '20 min',
    tone: 'amber',
  },
];

export const weeklySessions: Record<string, StudySession[]> = {
  Hoy: todaySessions,
  Mar: [
    {
      id: 'api',
      title: 'Diseñar endpoints REST',
      course: 'Desarrollo web',
      time: '19:00',
      duration: '60 min',
      tone: 'purple',
    },
    {
      id: 'database-review',
      title: 'Repasar consultas SQL',
      course: 'Base de Datos',
      time: '20:30',
      duration: '40 min',
      tone: 'mint',
    },
  ],
  Mié: [
    {
      id: 'mock',
      title: 'Simulacro corto',
      course: 'Arquitectura de Software',
      time: '18:30',
      duration: '35 min',
      tone: 'purple',
    },
  ],
  Jue: [
    {
      id: 'exam',
      title: 'Examen parcial',
      course: 'Arquitectura de Software',
      time: '10:00',
      duration: '90 min',
      tone: 'amber',
    },
  ],
};

export const courseProgress = [
  { name: 'Arquitectura de Software', completed: 68, tone: 'purple' as const },
  { name: 'Base de Datos', completed: 52, tone: 'mint' as const },
  { name: 'Desarrollo web', completed: 41, tone: 'amber' as const },
];

export const reviewDecks = [
  { id: 'architecture', name: 'Arquitectura', cards: 18, due: 8, tone: 'purple' as const },
  { id: 'database', name: 'Base de Datos', cards: 24, due: 6, tone: 'mint' as const },
  { id: 'english', name: 'Inglés técnico', cards: 32, due: 4, tone: 'amber' as const },
];

export const flashcard = {
  prompt: '¿Qué atributo de calidad mide la facilidad para modificar un sistema?',
  answer: 'La modificabilidad. Evalúa el esfuerzo necesario para cambiar, corregir o ampliar un sistema.',
  deck: 'Arquitectura de Software',
};
