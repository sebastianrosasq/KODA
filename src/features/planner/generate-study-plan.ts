import type { KodaWorkspace, PlannedSession, StudentExam, StudyTopic } from '@/types/koda-domain';

function daysUntil(dateIso: string) {
  const today = new Date();
  const examDate = new Date(`${dateIso}T12:00:00`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / millisecondsPerDay));
}

function getExamForCourse(exams: StudentExam[], courseId: string) {
  return exams
    .filter((exam) => exam.courseId === courseId && exam.kind !== 'activity')
    .sort((left, right) => left.dateIso.localeCompare(right.dateIso))[0];
}

function getTopicScore(topic: StudyTopic, exams: StudentExam[]) {
  const exam = getExamForCourse(exams, topic.courseId);
  const urgency = exam ? Math.max(0, 42 - daysUntil(exam.dateIso) * 5) : 8;
  const difficulty = exam ? exam.difficulty * 8 : 0;
  return topic.priority * 18 + urgency + difficulty - (topic.completed ? 1000 : 0);
}

export function generateStudyPlan(workspace: KodaWorkspace): PlannedSession[] {
  const activeCourses = workspace.courses.filter((course) => course.isActive);
  const rankedTopics = workspace.topics
    .filter((topic) => activeCourses.some((course) => course.id === topic.courseId) && !topic.completed)
    .slice()
    .sort((left, right) => getTopicScore(right, workspace.exams) - getTopicScore(left, workspace.exams));

  if (!activeCourses.length || !workspace.availability.length) {
    return [];
  }

  return workspace.availability.map((block, index) => {
    const topic = rankedTopics.length ? rankedTopics[index % rankedTopics.length] : undefined;
    const course = activeCourses.find((item) => item.id === topic?.courseId) ?? activeCourses[index % activeCourses.length];
    const exam = getExamForCourse(workspace.exams, course.id);
    const isCompleted = workspace.completedSessionIds.includes(block.id);
    const rationale = exam
      ? `Prioridad por ${exam.title.toLowerCase()} en ${daysUntil(exam.dateIso)} días.`
      : 'Bloque equilibrado según tus temas pendientes.';

    return {
      id: block.id,
      day: block.day,
      startsAt: block.startsAt,
      durationMinutes: block.durationMinutes,
      courseId: course.id,
      topicId: topic?.id,
      title: topic?.name ?? `Repaso de ${course.name}`,
      courseName: course.name,
      tone: course.tone,
      rationale,
      completed: isCompleted,
    };
  });
}

export function getDaysUntilExam(dateIso: string) {
  return daysUntil(dateIso);
}
