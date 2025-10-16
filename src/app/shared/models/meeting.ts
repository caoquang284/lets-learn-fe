export type MeetingComment = {
  id: string;
  userId: string; // Reference to User.id only
  time: string;
  text: string;
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
