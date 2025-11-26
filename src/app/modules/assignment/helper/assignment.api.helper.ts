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
  // Handle data - can be JSON string or direct object
  const parsedData = typeof assignment.data === 'string' 
    ? JSON.parse(assignment.data) 
    : assignment.data;
  
  // Handle response - can be JSON string or direct object
  const parsedResponse = assignment.response
    ? (typeof assignment.response === 'string' 
        ? JSON.parse(assignment.response) 
        : assignment.response)
    : undefined;

  return {
    ...assignment,
    data: parsedData,
    response: parsedResponse
      ? convertAssignmentResponseFromResponseData(parsedResponse)
      : undefined,
  };
};
