import type { GeneratedQuizQuestion } from '@/features/ai/study-documents';
import type { StudyFlashcard } from '@/types/koda-domain';

export type SimulationQuestion = GeneratedQuizQuestion & {
  id: string;
};

export type SimulationResult = {
  correctCount: number;
  incorrectQuestionIndexes: number[];
  percentage: number;
};

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function uniqueAnswers(cards: StudyFlashcard[], currentAnswer: string) {
  return cards
    .map((card) => card.answer.trim())
    .filter((answer, index, values) => answer && answer !== currentAnswer && values.indexOf(answer) === index);
}

export function buildFlashcardQuiz(cards: StudyFlashcard[], maximumQuestions = 5): SimulationQuestion[] {
  const usableCards = cards.filter((card) => card.prompt.trim() && card.answer.trim());
  return shuffled(usableCards).slice(0, maximumQuestions).flatMap((card, index) => {
    const distractors = shuffled(uniqueAnswers(usableCards, card.answer.trim())).slice(0, 3);
    const choices = shuffled([card.answer.trim(), ...distractors]);
    const correctOption = choices.indexOf(card.answer.trim());
    return choices.length >= 2 ? [{
      id: `flashcard-${card.id}-${index}`,
      question: card.prompt.trim(),
      options: choices,
      correctOption,
      explanation: `La respuesta correcta se basa en tu tarjeta de repaso: ${card.answer.trim()}`,
    }] : [];
  });
}

export function normalizeGeneratedQuiz(questions: GeneratedQuizQuestion[]): SimulationQuestion[] {
  return questions.flatMap((question, index) => {
    const options = question.options.map((option) => option.trim());
    if (
      !question.question.trim()
      || options.length !== 4
      || options.some((option) => !option)
      || new Set(options).size !== 4
      || question.correctOption < 0
      || question.correctOption >= options.length
    ) return [];
    return [{ ...question, id: `document-${index}`, question: question.question.trim(), options }];
  });
}

export function scoreSimulation(questions: SimulationQuestion[], answers: (number | null)[]): SimulationResult {
  const incorrectQuestionIndexes: number[] = [];
  let correctCount = 0;
  questions.forEach((question, index) => {
    if (answers[index] === question.correctOption) correctCount += 1;
    else incorrectQuestionIndexes.push(index);
  });
  return {
    correctCount,
    incorrectQuestionIndexes,
    percentage: questions.length ? Math.round((correctCount / questions.length) * 100) : 0,
  };
}
