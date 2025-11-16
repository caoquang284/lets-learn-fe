import { GET } from '@shared/api/utils.api';

// Fetch a LiveKit access token for a topic meeting room
// Backend should verify the current user and issue a signed token.
export const GetMeetingToken = (
  topicId: string,
  identity: string
): Promise<{ token: string; url?: string }> => {
  return GET(`/meeting/${topicId}/token`, { identity });
};

// Optional helpers you might expose later if needed
// export const CreateMeetingRoom = (topicId: string) => POST(`/meeting/${topicId}/room`);
// export const EndMeetingRoom = (topicId: string) => DELETE(`/meeting/${topicId}/room`);

