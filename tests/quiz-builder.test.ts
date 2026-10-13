import assert from 'node:assert/strict';
import test from 'node:test';

import { buildFlashcardQuiz, normalizeGeneratedQuiz, scoreSimulation } from '../src/features/assessments/quiz-builder';

const cards = [
  { id: 'card-1', courseId: 'course-1', prompt: '¿Qué es una variable?', answer: 'Un espacio que guarda un valor.', mastery: 0 as const },
  { id: 'card-2', courseId: 'course-1', prompt: '¿Qué es una función?', answer: 'Un bloque reutilizable de instrucciones.', mastery: 1 as const },
  { id: 'card-3', courseId: 'course-1', prompt: '¿Qué es un bucle?', answer: 'Una estructura que repite instrucciones.', mastery: 2 as const },
];

test('crea preguntas de alternativas desde flashcards sin inventar respuestas', () => {
  const questions = buildFlashcardQuiz(cards);

  assert.equal(questions.length, 3);
  questions.forEach((question) => {
    assert.ok(question.options.length >= 2);
    assert.equal(question.options[question.correctOption], cards.find((card) => card.prompt === question.question)?.answer);
  });
});

test('rechaza preguntas de IA incompletas o con alternativas duplicadas', () => {
  const questions = normalizeGeneratedQuiz([
    { question: 'Válida', options: ['A', 'B', 'C', 'D'], correctOption: 2, explanation: 'Porque C.' },
    { question: 'Duplicada', options: ['A', 'A', 'C', 'D'], correctOption: 0, explanation: 'No debe entrar.' },
    { question: 'Incompleta', options: ['A', 'B', 'C'], correctOption: 0, explanation: 'No debe entrar.' },
  ]);

  assert.equal(questions.length, 1);
  assert.equal(questions[0].options[questions[0].correctOption], 'C');
});

test('calcula resultados e identifica las preguntas incorrectas', () => {
  const questions = normalizeGeneratedQuiz([
    { question: 'Uno', options: ['A', 'B', 'C', 'D'], correctOption: 1, explanation: 'B.' },
    { question: 'Dos', options: ['A', 'B', 'C', 'D'], correctOption: 3, explanation: 'D.' },
  ]);
  const result = scoreSimulation(questions, [1, 0]);

  assert.deepEqual(result, { correctCount: 1, incorrectQuestionIndexes: [1], percentage: 50 });
});
