import {
  ChoiceQuestion,
  Question,
  QuestionType,
  ShortAnswerQuestion,
  TrueFalseQuestion,
} from '@shared/models/question';
import { convertChoiceQuestionToRequestData } from './choice-question.api.helper';
import { convertShortAnswerQuestionToRequestData } from './short-answer-question.api.helper';
import { convertTrueFalseQuestionToRequestData } from './true-false-question.api.helper';

export const convertQuestionToRequestData = (
  question: Question,
  courseId: string = ''
) => {
  const { type } = question;
  if (type === QuestionType.CHOICE) {
    return convertChoiceQuestionToRequestData(question, courseId);
  } else if (type === QuestionType.SHORT_ANSWER) {
    return convertShortAnswerQuestionToRequestData(question, courseId);
  }
  return convertTrueFalseQuestionToRequestData(question, courseId);
};

export const convertQuestionFromResponseData = (data: any): Question => {
  let {
    id,
    topicQuizId,
    questionName,
    questionText,
    status,
    type,
    defaultMark,
    usage,
    feedbackOfTrue,
    feedbackOfFalse,
    correctAnswer,
    multiple,
    choices,
    createdAt,
    createdById,
    modifiedById,
    updatedAt,
  } = data;

  // Map backend field names to frontend field names
  const createdBy = createdById;
  const modifiedBy = modifiedById;
  const modifiedAt = updatedAt;

  // Map backend type strings to frontend QuestionType enum
  let questionType = type;
  if (type === 'Choices Answer') {
    questionType = QuestionType.CHOICE;
  } else if (type === 'True/False') {
    questionType = QuestionType.TRUE_FALSE;
  } else if (type === 'Short Answer') {
    questionType = QuestionType.SHORT_ANSWER;
  }

  const choiceQuestion: ChoiceQuestion = {
    choices,
    multiple,
  };
  const shortAnswerQuestion: ShortAnswerQuestion = {
    choices,
  };
  const trueFalseQuestion: TrueFalseQuestion = {
    correctAnswer,
    feedbackOfTrue,
    feedbackOfFalse,
  };

  //Choice question default value
  const question: Question = {
    id,
    topicQuizId,
    questionName,
    questionText,
    status,
    type: questionType,
    defaultMark,
    usage,
    data: choiceQuestion,
    createdAt: createdAt ? new Date(createdAt) : undefined,
    modifiedAt: modifiedAt ? new Date(modifiedAt) : (createdAt ? new Date(createdAt) : undefined),
    createdBy,
    modifiedBy,
  };

  if (questionType === QuestionType.SHORT_ANSWER) {
    question.data = shortAnswerQuestion;
  } else if (questionType === QuestionType.TRUE_FALSE) {
    question.data = trueFalseQuestion;
  }
  return question;
};
