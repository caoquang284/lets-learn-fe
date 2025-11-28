import {
  QuizAnswer,
  QuizResponseData,
  StudentResponse,
} from '@shared/models/student-response';

export const convertQuizResponseToRequestData = (
  quizResponse: StudentResponse
) => {
  const { topicId, data } = quizResponse;
  const { answers, status, completedAt, startedAt } = data as QuizResponseData;
  return {
    topicId,
    data: {
      status,
      startedAt,
      completedAt,
      answers: answers.map(convertQuizResponseAnswerToRequestData),
    }
  };
};

export const convertQuizResponseFromResponseData = (
  responseData: any
): StudentResponse => {
  const { id, topicId, studentId, data } = responseData;
  
  if (data) {
    const { status, startedAt, completedAt, answers } = data;
    return {
      id,
      topicId,
      studentId,
      data: {
        status,
        startedAt,
        completedAt,
        answers: answers?.map(convertQuizResponseAnswerFromResponseData) || [],
      },
    };
  }
  
  const { status, startedAt, completedAt, answers, student } = responseData;
  return {
    id,
    topicId,
    studentId: student?.id || responseData.studentId,
    data: {
      status,
      startedAt,
      completedAt,
      answers: answers?.map(convertQuizResponseAnswerFromResponseData) || [],
    },
  };
};

export const convertQuizResponseAnswerToRequestData = (answers: QuizAnswer) => {
  const { question, answer, mark } = answers;
  return {
    topicQuizQuestionId: question.id,
    answer,
    mark,
  };
};

export const convertQuizResponseAnswerFromResponseData = (
  data: any
): QuizAnswer => {
  // Backend now returns topicQuizQuestionId instead of question object
  const { topicQuizQuestionId, question, answer, mark } = data;
  
  // If we have topicQuizQuestionId (new format), create a minimal question object
  if (topicQuizQuestionId && !question) {
    return {
      question: { id: topicQuizQuestionId } as any, // Minimal question object with just ID
      answer,
      mark,
    };
  }
  
  // If we have the question field (old format), parse it
  if (question) {
    return {
      question: JSON.parse(question),
      answer,
      mark,
    };
  }
  
  // Fallback
  return {
    question: { id: topicQuizQuestionId || '' } as any,
    answer,
    mark,
  };
};
