import { GET } from '@shared/api/utils.api';

// Fetch a LiveKit access token for a topic meeting room
// Backend should verify the current user and issue a signed token.
export const GetMeetingToken = (
  topicId: string,
  courseId: string
): Promise<{ token: string; roomName: string; wsUrl: string }> => {
  return GET(`/course/${courseId}/meeting/${topicId}/token`);
};

