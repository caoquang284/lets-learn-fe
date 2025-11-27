import { Question, ShortAnswerQuestion } from '@shared/models/question';
import { convertChoicesInQuestionToRequestData } from './choice-question.api.helper';

export const convertShortAnswerQuestionToRequestData = (
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
  
  // Handle both cases: question.data exists or choices are at top level
  const shortAnswerData = question.data as ShortAnswerQuestion;
  const choices = shortAnswerData?.choices || (question as any).choices || [];

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
    multiple: false,
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
