export type CourseTone = 'plum' | 'mint' | 'amber' | 'sky';

export type StudentAcademicProfile = {
  displayName: string;
  institutionSlug: string;
  institutionName: string;
  programSlug: string;
  programName: string;
  currentTerm: number;
};

export type StudentCourse = {
  id: string;
  name: string;
  termNumber: number;
  isActive: boolean;
  wasPreloaded: boolean;
  tone: CourseTone;
};

export type StudentExam = {
  id: string;
  courseId: string;
  dateIso: string;
  title: string;
  difficulty: 1 | 2 | 3;
};

export type StudyTopic = {
  id: string;
  courseId: string;
  name: string;
  priority: 1 | 2 | 3;
  completed: boolean;
};

export type DayLabel = 'Hoy' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb' | 'Dom';

export type AvailabilityBlock = {
  id: string;
  day: DayLabel;
  startsAt: string;
  durationMinutes: number;
};

export type PlannedSession = {
  id: string;
  day: DayLabel;
  startsAt: string;
  durationMinutes: number;
  courseId: string;
  topicId?: string;
  title: string;
  courseName: string;
  tone: CourseTone;
  rationale: string;
  completed: boolean;
};

export type KodaWorkspace = {
  profile: StudentAcademicProfile;
  courses: StudentCourse[];
  exams: StudentExam[];
  topics: StudyTopic[];
  availability: AvailabilityBlock[];
  completedSessionIds: string[];
};
