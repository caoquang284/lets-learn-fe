import { MeetingTopic } from '@shared/models/topic';

export const convertMeetingToRequestData = (meeting: MeetingTopic) => {
  const { id, data } = meeting;
  return {
    ...meeting,
    id: id.length === 4 ? null : id,
    data: data ? JSON.stringify(data) : null,
  };
};
