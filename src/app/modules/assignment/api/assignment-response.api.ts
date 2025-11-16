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
  ).then(convertAssignmentResponseFromResponseData);
};

export const CreateAssignmentResponse = (
  topicId: string,
  assignmentResponse: StudentResponse
) => {
  const data = convertAssignmentResponseToRequestData(assignmentResponse);
  return POST(`/topic/${topicId}/assignment-response`, data).then(
    convertAssignmentResponseFromResponseData
  );
};

export const UpdateAssignmentResponse = (
  topicId: string,
  assignmentResponse: StudentResponse
) => {
  const data = convertAssignmentResponseToRequestData(assignmentResponse);
  return PUT(
    `/topic/${topicId}/assignment-response/${assignmentResponse.id}`,
    data
  ).then(convertAssignmentResponseFromResponseData);
};

export const GetAllAssignmentResponsesOfTopic = (topicId: string) => {
  return GET(`/topic/${topicId}/assignment-response`).then((res) =>
    res.map(convertAssignmentResponseFromResponseData)
  );
};

export const GetAllAssignmentResponsesOfUser = (userId: string) => {
  return GET(`/user/${userId}/assignment-responses`).then((res) =>
    res.map(convertAssignmentResponseFromResponseData)
  );
};

export const DeleteAssignmentResponse = (
  topicId: string,
  assignmentResponseId: string
) => {
  return DELETE(
    `/topic/${topicId}/assignment-response/${assignmentResponseId}`
  );
};
