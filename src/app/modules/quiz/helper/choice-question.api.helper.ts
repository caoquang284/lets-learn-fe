import {
  ChoiceQuestion,
  Question,
  QuestionChoice,
} from '@shared/models/question';

export const convertChoicesInQuestionToRequestData = (
  choices: QuestionChoice[]
) => {
  return (choices ?? []).map((choice) => {
    return {
      id: choice.id.length === 4 ? null : choice.id,
      text: choice.text,
      gradePercent: choice.gradePercent,
      feedback: choice.feedback,
      questionId: choice.questionId.length === 4 ? null : choice.questionId,
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
  const { choices, multiple } = question.data as ChoiceQuestion;

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
