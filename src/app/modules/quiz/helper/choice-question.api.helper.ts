import {
  ChoiceQuestion,
  Question,
  QuestionChoice,
} from '@shared/models/question';

export const convertChoicesInQuestionToRequestData = (
  choices: QuestionChoice[]
) => {
  return (choices ?? []).map((choice) => {
    // Handle both frontend (questionId) and backend (quizQuestionId) structures
    const qId = choice.questionId || (choice as any).quizQuestionId;
    
    return {
      id: choice.id && choice.id.length === 4 ? null : choice.id,
      text: choice.text,
      gradePercent: choice.gradePercent,
      feedback: choice.feedback,
      questionId: qId && qId.length === 4 ? null : qId,
    };
  });
};

export const convertChoiceQuestionToRequestData = (
  question: Question,
  courseId?: string // just need when CRUD with question bank
) => {
  const {
    id,
    topicQuizId,
    questionName,
    questionText,
    status,
    type,
    defaultMark,
    usage,
    createdAt,
    createdBy,
    modifiedBy,
  } = question;
  
  // Handle both cases: question.data exists or choices/multiple are at top level
  const choiceData = question.data as ChoiceQuestion;
  const choices = choiceData?.choices || (question as any).choices || [];
  const multiple = choiceData?.multiple ?? (question as any).multiple ?? false;

  let reqData = {
    id: id.length === 4 ? null : id,
    topicQuizId: topicQuizId ?? null,
    questionName,
    questionText,
    status,
    type,
    defaultMark,
    usage,
    feedbackOfTrue: null,
    feedbackOfFalse: null,
    correctAnswer: false,
    multiple,
    choices: convertChoicesInQuestionToRequestData(choices),
    course: {
      id: courseId,
    },
    createdAt,
    createdBy,
    modifiedBy,
    updatedAt: null,
    deletedAt: null,
  };
  return reqData;
};
