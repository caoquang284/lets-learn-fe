import { StudentResponse } from '@shared/models/student-response';
import {
  convertAssignmentResponseFromResponseData,
  convertAssignmentResponseToRequestData,
} from '../helper/assignment-response.api.helper';
import { DELETE, GET, POST, PUT } from '@shared/api/utils.api';

export const GetAssignmentResponse = (
  topicId: string,
  assignmentResponseId: string
) => {
  return GET(
    `/topic/${topicId}/assignment-response/${assignmentResponseId}`
  )
};

export const CreateAssignmentResponse = (
  topicId: string,
  assignmentResponse: StudentResponse
) => {
  const data = convertAssignmentResponseToRequestData(assignmentResponse);
  return POST(`/topic/${topicId}/assignment-response`, data)
};

export const UpdateAssignmentResponse = (
  topicId: string,
  assignmentResponse: StudentResponse
) => {
  const data = convertAssignmentResponseToRequestData(assignmentResponse);
  return PUT(
    `/topic/${topicId}/assignment-response/${assignmentResponse.id}`,
    data
  )
};

export const GetAllAssignmentResponsesOfTopic = (topicId: string) => {
  return GET(`/topic/${topicId}/assignment-response`)
};

export const GetAllAssignmentResponsesOfUser = (userId: string) => {
  return GET(`/user/${userId}/assignment-responses`)
};

export const DeleteAssignmentResponse = (
  topicId: string,
  assignmentResponseId: string
) => {
  return DELETE(
    `/topic/${topicId}/assignment-response/${assignmentResponseId}`
  );
};
