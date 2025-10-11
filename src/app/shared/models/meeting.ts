export type MeetingComment = {
  id: string;
  author: string;
  time: string;
  text: string;
  avatar: string;
  userId: string;
}

export type MeetingData = {
  id: string;
  topic: string;
  description: string;
  meetingDate: Date;
  meetingUrl?: string;
  isActive: boolean;
  comments: MeetingComment[];
}
