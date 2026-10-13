import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getDaysUntilExam, generateStudyPlan } from '@/features/planner/generate-study-plan';
import type {
  AvailabilityBlock,
  CourseTone,
  KodaWorkspace,
  StudentAcademicProfile,
  StudentExam,
  StudyTopic,
} from '@/types/koda-domain';

const STORAGE_KEY = '@koda/workspace-v1';
const tones: CourseTone[] = ['plum', 'mint', 'amber', 'sky'];

function dateInDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const defaultWorkspace: KodaWorkspace = {
  profile: {
    displayName: 'Sebastián',
    institutionSlug: 'tecsup',
    institutionName: 'TECSUP',
    programSlug: 'diseno-desarrollo-software',
    programName: 'Diseño y Desarrollo de Software',
    currentTerm: 4,
  },
  courses: [
    { id: 'architecture', name: 'Arquitectura de Software', termNumber: 4, isActive: true, wasPreloaded: true, tone: 'plum' },
    { id: 'database', name: 'Base de Datos', termNumber: 4, isActive: true, wasPreloaded: true, tone: 'mint' },
    { id: 'web', name: 'Desarrollo web', termNumber: 4, isActive: true, wasPreloaded: true, tone: 'amber' },
    { id: 'english', name: 'Inglés técnico', termNumber: 4, isActive: true, wasPreloaded: true, tone: 'sky' },
  ],
  exams: [
    { id: 'exam-architecture', courseId: 'architecture', title: 'Examen parcial', dateIso: dateInDays(3), difficulty: 3 },
    { id: 'exam-database', courseId: 'database', title: 'Práctica calificada', dateIso: dateInDays(5), difficulty: 2 },
  ],
  topics: [
    { id: 'architecture-patterns', courseId: 'architecture', name: 'Patrones y atributos de calidad', priority: 3, completed: false },
    { id: 'architecture-integration', courseId: 'architecture', name: 'Patrones de integración', priority: 2, completed: false },
    { id: 'database-normalization', courseId: 'database', name: 'Normalización y dependencias', priority: 3, completed: false },
    { id: 'database-sql', courseId: 'database', name: 'Consultas SQL', priority: 2, completed: false },
    { id: 'web-rest', courseId: 'web', name: 'Diseño de endpoints REST', priority: 2, completed: false },
    { id: 'english-vocabulary', courseId: 'english', name: 'Vocabulario técnico', priority: 1, completed: false },
  ],
  availability: [
    { id: 'today-1830', day: 'Hoy', startsAt: '18:30', durationMinutes: 45 },
    { id: 'today-2000', day: 'Hoy', startsAt: '20:00', durationMinutes: 50 },
    { id: 'mar-1900', day: 'Mar', startsAt: '19:00', durationMinutes: 60 },
    { id: 'mie-1830', day: 'Mié', startsAt: '18:30', durationMinutes: 40 },
    { id: 'jue-1800', day: 'Jue', startsAt: '18:00', durationMinutes: 35 },
  ],
  completedSessionIds: ['today-1830'],
};

type KodaDataContextValue = {
  hydrated: boolean;
  workspace: KodaWorkspace;
  plan: ReturnType<typeof generateStudyPlan>;
  updateProfile: (profile: StudentAcademicProfile) => void;
  addCourse: (name: string) => void;
  preloadCourses: (names: string[]) => void;
  removeCourse: (courseId: string) => void;
  setCourseActive: (courseId: string, isActive: boolean) => void;
  addExam: (exam: Omit<StudentExam, 'id'>) => void;
  addTopic: (topic: Omit<StudyTopic, 'id' | 'completed'>) => void;
  toggleTopic: (topicId: string) => void;
  updateAvailability: (availability: AvailabilityBlock[]) => void;
  completeSession: (sessionId: string) => void;
  dashboard: {
    courseProgress: { id: string; name: string; completed: number; tone: CourseTone }[];
    nextExam: {
      course: string;
      topic: string;
      dateLabel: string;
      remaining: string;
      preparation: number;
    } | null;
  };
};

const KodaDataContext = createContext<KodaDataContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function KodaDataProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState(defaultWorkspace);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    void AsyncStorage.getItem(STORAGE_KEY)
      .then((storedWorkspace) => {
        if (!storedWorkspace || !active) return;
        setWorkspace(JSON.parse(storedWorkspace) as KodaWorkspace);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateWorkspace = useCallback((updater: (current: KodaWorkspace) => KodaWorkspace) => {
    setWorkspace((current) => {
      const next = updater(current);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const updateProfile = useCallback((profile: StudentAcademicProfile) => {
    updateWorkspace((current) => ({ ...current, profile }));
  }, [updateWorkspace]);

  const addCourse = useCallback((name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;

    updateWorkspace((current) => ({
      ...current,
      courses: [
        ...current.courses,
        {
          id: createId('course'),
          name: normalizedName,
          termNumber: current.profile.currentTerm,
          isActive: true,
          wasPreloaded: false,
          tone: tones[current.courses.length % tones.length],
        },
      ],
    }));
  }, [updateWorkspace]);

  const preloadCourses = useCallback((names: string[]) => {
    updateWorkspace((current) => {
      const existing = new Set(current.courses.map((course) => course.name.toLocaleLowerCase()));
      const newCourses = names
        .filter((name) => !existing.has(name.toLocaleLowerCase()))
        .map((name, index) => ({
          id: createId('course'),
          name,
          termNumber: current.profile.currentTerm,
          isActive: true,
          wasPreloaded: true,
          tone: tones[(current.courses.length + index) % tones.length],
        }));
      return { ...current, courses: [...current.courses, ...newCourses] };
    });
  }, [updateWorkspace]);

  const removeCourse = useCallback((courseId: string) => {
    updateWorkspace((current) => ({
      ...current,
      courses: current.courses.filter((course) => course.id !== courseId),
      exams: current.exams.filter((exam) => exam.courseId !== courseId),
      topics: current.topics.filter((topic) => topic.courseId !== courseId),
    }));
  }, [updateWorkspace]);

  const setCourseActive = useCallback((courseId: string, isActive: boolean) => {
    updateWorkspace((current) => ({
      ...current,
      courses: current.courses.map((course) => (course.id === courseId ? { ...course, isActive } : course)),
    }));
  }, [updateWorkspace]);

  const addExam = useCallback((exam: Omit<StudentExam, 'id'>) => {
    updateWorkspace((current) => ({ ...current, exams: [...current.exams, { ...exam, id: createId('exam') }] }));
  }, [updateWorkspace]);

  const addTopic = useCallback((topic: Omit<StudyTopic, 'id' | 'completed'>) => {
    const name = topic.name.trim();
    if (!name) return;
    updateWorkspace((current) => ({
      ...current,
      topics: [...current.topics, { ...topic, name, id: createId('topic'), completed: false }],
    }));
  }, [updateWorkspace]);

  const toggleTopic = useCallback((topicId: string) => {
    updateWorkspace((current) => ({
      ...current,
      topics: current.topics.map((topic) => (topic.id === topicId ? { ...topic, completed: !topic.completed } : topic)),
    }));
  }, [updateWorkspace]);

  const updateAvailability = useCallback((availability: AvailabilityBlock[]) => {
    updateWorkspace((current) => ({ ...current, availability }));
  }, [updateWorkspace]);

  const completeSession = useCallback((sessionId: string) => {
    updateWorkspace((current) => {
      const alreadyCompleted = current.completedSessionIds.includes(sessionId);
      return {
        ...current,
        completedSessionIds: alreadyCompleted
          ? current.completedSessionIds.filter((id) => id !== sessionId)
          : [...current.completedSessionIds, sessionId],
      };
    });
  }, [updateWorkspace]);

  const plan = useMemo(() => generateStudyPlan(workspace), [workspace]);
  const dashboard = useMemo(() => {
    const courseProgress = workspace.courses
      .filter((course) => course.isActive)
      .map((course) => {
        const topics = workspace.topics.filter((topic) => topic.courseId === course.id);
        const completed = topics.length
          ? Math.round((topics.filter((topic) => topic.completed).length / topics.length) * 100)
          : 0;
        return { id: course.id, name: course.name, completed, tone: course.tone };
      });
    const nextExam = workspace.exams
      .slice()
      .sort((left, right) => left.dateIso.localeCompare(right.dateIso))[0];

    if (!nextExam) return { courseProgress, nextExam: null };

    const course = workspace.courses.find((item) => item.id === nextExam.courseId);
    const nextTopic = workspace.topics.find((topic) => topic.courseId === nextExam.courseId && !topic.completed);
    const relatedProgress = courseProgress.find((item) => item.id === nextExam.courseId)?.completed ?? 0;
    const remainingDays = getDaysUntilExam(nextExam.dateIso);

    return {
      courseProgress,
      nextExam: {
        course: course?.name ?? 'Curso pendiente',
        topic: nextTopic?.name ?? 'Repaso general',
        dateLabel: new Date(`${nextExam.dateIso}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
        remaining: `${remainingDays} ${remainingDays === 1 ? 'día' : 'días'}`,
        preparation: relatedProgress,
      },
    };
  }, [workspace]);

  const value = useMemo(
    () => ({
      hydrated,
      workspace,
      plan,
      updateProfile,
      addCourse,
      preloadCourses,
      removeCourse,
      setCourseActive,
      addExam,
      addTopic,
      toggleTopic,
      updateAvailability,
      completeSession,
      dashboard,
    }),
    [
      addCourse,
      addExam,
      addTopic,
      completeSession,
      dashboard,
      hydrated,
      plan,
      preloadCourses,
      removeCourse,
      setCourseActive,
      toggleTopic,
      updateAvailability,
      updateProfile,
      workspace,
    ],
  );

  return <KodaDataContext.Provider value={value}>{children}</KodaDataContext.Provider>;
}

export function useKodaData() {
  const context = useContext(KodaDataContext);
  if (!context) throw new Error('useKodaData debe usarse dentro de KodaDataProvider.');
  return context;
}
