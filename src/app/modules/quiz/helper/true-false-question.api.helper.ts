import { Question, TrueFalseQuestion } from '@shared/models/question';

export const convertTrueFalseQuestionToRequestData = (
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
  
  // Handle both cases: question.data exists or fields are at top level
  const trueFalseData = question.data as TrueFalseQuestion;
  const correctAnswer = trueFalseData?.correctAnswer ?? (question as any).correctAnswer ?? false;
  const feedbackOfFalse = trueFalseData?.feedbackOfFalse ?? (question as any).feedbackOfFalse ?? null;
  const feedbackOfTrue = trueFalseData?.feedbackOfTrue ?? (question as any).feedbackOfTrue ?? null;

  let reqData = {
    id: id.length === 4 ? null : id,
    topicQuizId: topicQuizId ?? null,
    questionName,
    questionText,
    status,
    type,
    defaultMark,
    usage,
    feedbackOfTrue,
    feedbackOfFalse,
    correctAnswer,
    multiple: false,
    choices: [],
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
