import assert from 'node:assert/strict';
import test from 'node:test';

import { generateStudyPlan } from '../src/features/planner/generate-study-plan';
import type { KodaWorkspace } from '../src/types/koda-domain';

function isoDateIn(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createWorkspace(): KodaWorkspace {
  return {
    academicProfileCompleted: true,
    profile: {
      displayName: 'Estudiante',
      institutionSlug: 'tecsup',
      institutionName: 'TECSUP',
      programSlug: 'software',
      programName: 'Software',
      currentTerm: 2,
    },
    courses: [
      { id: 'course-active', name: 'Programación', termNumber: 2, isActive: true, wasPreloaded: true, tone: 'plum' },
      { id: 'course-inactive', name: 'Curso archivado', termNumber: 1, isActive: false, wasPreloaded: true, tone: 'mint' },
    ],
    exams: [],
    topics: [
      { id: 'topic-active', courseId: 'course-active', name: 'Funciones', priority: 2, completed: false },
      { id: 'topic-inactive', courseId: 'course-inactive', name: 'Tema archivado', priority: 3, completed: false },
    ],
    flashcards: [],
    availability: [{ id: 'slot-1', day: 'Lun', startsAt: '18:00', durationMinutes: 60 }],
    completedSessionIds: [],
  };
}

test('no genera sesiones si el estudiante todavía no registró disponibilidad', () => {
  const workspace = createWorkspace();
  workspace.availability = [];

  assert.deepEqual(generateStudyPlan(workspace), []);
});

test('usa solo cursos activos y conserva el estado de una sesión completada', () => {
  const workspace = createWorkspace();
  workspace.completedSessionIds = ['slot-1'];

  const [session] = generateStudyPlan(workspace);

  assert.equal(session.courseId, 'course-active');
  assert.equal(session.topicId, 'topic-active');
  assert.equal(session.title, 'Funciones');
  assert.equal(session.completed, true);
});

test('una actividad no se presenta como examen prioritario', () => {
  const workspace = createWorkspace();
  workspace.exams = [
    {
      id: 'activity-1',
      courseId: 'course-active',
      dateIso: isoDateIn(1),
      title: 'Entrega de práctica',
      difficulty: 3,
      kind: 'activity',
    },
  ];

  const [session] = generateStudyPlan(workspace);

  assert.equal(session.rationale, 'Bloque equilibrado según tus temas pendientes.');
});

test('prioriza una evaluación próxima con una explicación comprensible', () => {
  const workspace = createWorkspace();
  workspace.exams = [
    {
      id: 'exam-1',
      courseId: 'course-active',
      dateIso: isoDateIn(2),
      title: 'Parcial de programación',
      difficulty: 2,
      kind: 'assessment',
    },
  ];

  const [session] = generateStudyPlan(workspace);

  assert.match(session.rationale, /^Prioridad por parcial de programación en \d+ días\.$/);
});
