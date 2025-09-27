import { AssignmentTopic } from '@shared/models/topic';
import { convertAssignmentResponseFromResponseData } from './assignment-response.api.helper';

export const convertAssignmentToRequestData = (assignment: AssignmentTopic) => {
  const { id, data } = assignment;
  return {
    ...assignment,
    id: id.length === 4 ? null : id,
    data: data ? JSON.stringify(data) : null,
  };
};

export const convertAssignmentFromResponseData = (
  assignment: any
): AssignmentTopic => {
  const parsedData = JSON.parse(assignment.data);
  const parsedResponse = assignment.response
    ? JSON.parse(assignment.response)
    : undefined;

  return {
    ...assignment,
    data: parsedData,
    response: parsedResponse
      ? convertAssignmentResponseFromResponseData(parsedResponse)
      : undefined,
  };
};
