import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { getDaysUntilExam, generateStudyPlan } from '@/features/planner/generate-study-plan';
import { loadWorkspaceFromSupabase, syncWorkspaceToSupabase } from '@/features/workspace/supabase-workspace';
import { useKodaAuth } from '@/providers/koda-auth-provider';
import type {
  AvailabilityBlock,
  CourseTone,
  KodaWorkspace,
  StudentAcademicProfile,
  StudentExam,
  StudyFlashcard,
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
  flashcards: [
    {
      id: 'flashcard-quality',
      courseId: 'architecture',
      prompt: '¿Qué atributo de calidad mide la facilidad para modificar un sistema?',
      answer: 'La modificabilidad: el esfuerzo necesario para cambiar, corregir o ampliar un sistema.',
      mastery: 1,
    },
    {
      id: 'flashcard-normalization',
      courseId: 'database',
      prompt: '¿Cuál es el objetivo de la normalización de una base de datos?',
      answer: 'Reducir redundancia y dependencias anómalas sin perder información importante.',
      mastery: 0,
    },
    {
      id: 'flashcard-rest',
      courseId: 'web',
      prompt: '¿Qué comunica un endpoint REST bien diseñado?',
      answer: 'Un recurso y una acción coherente mediante su ruta, método HTTP y respuesta.',
      mastery: 0,
    },
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

function normalizeWorkspace(candidate: Partial<KodaWorkspace>): KodaWorkspace {
  return {
    ...defaultWorkspace,
    ...candidate,
    profile: candidate.profile ?? defaultWorkspace.profile,
    courses: candidate.courses ?? defaultWorkspace.courses,
    exams: candidate.exams ?? defaultWorkspace.exams,
    topics: candidate.topics ?? defaultWorkspace.topics,
    flashcards: candidate.flashcards ?? [],
    availability: candidate.availability ?? defaultWorkspace.availability,
    completedSessionIds: candidate.completedSessionIds ?? defaultWorkspace.completedSessionIds,
  };
}

type KodaDataContextValue = {
  hydrated: boolean;
  syncState: 'local' | 'syncing' | 'synced' | 'error';
  syncError: string | null;
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
  addFlashcard: (flashcard: Omit<StudyFlashcard, 'id' | 'mastery'>) => void;
  reviewFlashcard: (flashcardId: string, remembered: boolean) => void;
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
  const { session } = useKodaAuth();
  const [workspace, setWorkspace] = useState(defaultWorkspace);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<KodaDataContextValue['syncState']>('local');
  const [syncError, setSyncError] = useState<string | null>(null);
  const workspaceRef = useRef(workspace);
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());
  const syncedUserIdRef = useRef<string | null>(null);

  const saveLocalWorkspace = useCallback((next: KodaWorkspace) => {
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const setCurrentWorkspace = useCallback((next: KodaWorkspace) => {
    workspaceRef.current = next;
    setWorkspace(next);
    saveLocalWorkspace(next);
  }, [saveLocalWorkspace]);

  useEffect(() => {
    let active = true;

    void AsyncStorage.getItem(STORAGE_KEY)
      .then((storedWorkspace) => {
        if (!storedWorkspace || !active) return;
        const restored = normalizeWorkspace(JSON.parse(storedWorkspace) as Partial<KodaWorkspace>);
        workspaceRef.current = restored;
        setWorkspace(restored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const enqueueRemoteSync = useCallback((next: KodaWorkspace) => {
    const userId = session?.user.id;
    if (!userId || syncedUserIdRef.current !== userId) return;

    syncQueueRef.current = syncQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        if (syncedUserIdRef.current !== userId) return;
        setSyncState('syncing');
        setSyncError(null);
        await syncWorkspaceToSupabase(userId, next);
        if (syncedUserIdRef.current === userId) setSyncState('synced');
      })
      .catch((error: unknown) => {
        if (syncedUserIdRef.current !== userId) return;
        setSyncState('error');
        setSyncError(error instanceof Error ? error.message : 'No se pudo sincronizar tu espacio.');
      });
  }, [session?.user.id]);

  useEffect(() => {
    const userId = session?.user.id;
    if (!hydrated || !userId) {
      syncedUserIdRef.current = null;
      const resetState = setTimeout(() => {
        setSyncState('local');
        setSyncError(null);
      }, 0);
      return () => clearTimeout(resetState);
    }

    let active = true;

    void loadWorkspaceFromSupabase(userId, workspaceRef.current)
      .then(async (remoteWorkspace) => {
        if (!active) return;
        if (remoteWorkspace) {
          setCurrentWorkspace(remoteWorkspace);
        }
        syncedUserIdRef.current = userId;
        await syncWorkspaceToSupabase(userId, remoteWorkspace ?? workspaceRef.current);
        if (active) setSyncState('synced');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSyncState('error');
        setSyncError(error instanceof Error ? error.message : 'No se pudo iniciar la sincronización.');
      });

    return () => {
      active = false;
      if (syncedUserIdRef.current === userId) syncedUserIdRef.current = null;
    };
  }, [hydrated, session?.user.id, setCurrentWorkspace]);

  const updateWorkspace = useCallback((updater: (current: KodaWorkspace) => KodaWorkspace) => {
    const next = updater(workspaceRef.current);
    setCurrentWorkspace(next);
    enqueueRemoteSync(next);
  }, [enqueueRemoteSync, setCurrentWorkspace]);

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
      flashcards: current.flashcards.filter((flashcard) => flashcard.courseId !== courseId),
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

  const addFlashcard = useCallback((flashcard: Omit<StudyFlashcard, 'id' | 'mastery'>) => {
    const prompt = flashcard.prompt.trim();
    const answer = flashcard.answer.trim();
    if (!prompt || !answer) return;
    updateWorkspace((current) => ({
      ...current,
      flashcards: [...current.flashcards, { ...flashcard, prompt, answer, id: createId('flashcard'), mastery: 0 }],
    }));
  }, [updateWorkspace]);

  const reviewFlashcard = useCallback((flashcardId: string, remembered: boolean) => {
    updateWorkspace((current) => ({
      ...current,
      flashcards: current.flashcards.map((flashcard) => {
        if (flashcard.id !== flashcardId) return flashcard;
        const nextMastery = remembered
          ? Math.min(3, flashcard.mastery + 1)
          : Math.max(0, flashcard.mastery - 1);
        return { ...flashcard, mastery: nextMastery as StudyFlashcard['mastery'], lastReviewedAt: new Date().toISOString() };
      }),
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
      syncState,
      syncError,
      workspace,
      plan,
      updateProfile,
      addCourse,
      preloadCourses,
      removeCourse,
      setCourseActive,
      addExam,
      addTopic,
      addFlashcard,
      toggleTopic,
      reviewFlashcard,
      updateAvailability,
      completeSession,
      dashboard,
    }),
    [
      addCourse,
      addExam,
      addTopic,
      addFlashcard,
      completeSession,
      dashboard,
      hydrated,
      plan,
      preloadCourses,
      removeCourse,
      reviewFlashcard,
      setCourseActive,
      toggleTopic,
      updateAvailability,
      updateProfile,
      workspace,
      syncError,
      syncState,
    ],
  );

  return <KodaDataContext.Provider value={value}>{children}</KodaDataContext.Provider>;
}

export function useKodaData() {
  const context = useContext(KodaDataContext);
  if (!context) throw new Error('useKodaData debe usarse dentro de KodaDataProvider.');
  return context;
}
