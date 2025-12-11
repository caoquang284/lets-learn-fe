import { GET, POST } from '@shared/api/utils.api';
import {
  convertQuizResponseFromResponseData,
  convertQuizResponseToRequestData,
} from '../helper/quiz-response.api.helper';
import { StudentResponse } from '@shared/models/student-response';

export const GetQuizResponse = (topicId: string, quizResponseId: string) => {
  return GET(`/topic/${topicId}/quiz-response/${quizResponseId}`)
};

export const CreateQuizResponse = (
  topicId: string,
  quizResponse: StudentResponse
) => {
  const data = convertQuizResponseToRequestData(quizResponse);
  return POST(`/topic/${topicId}/quiz-response`, data)
};

export const GetAllQuizResponsesOfTopic = (
  topicId: string
): Promise<StudentResponse[]> => {
  return GET(`/topic/${topicId}/quiz-response`)
};

export const GetAllQuizResponsesOfUser = (userId: string) => {
  return GET(`/user/${userId}/quiz-responses`)
};
