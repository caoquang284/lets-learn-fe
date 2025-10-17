import { MeetingComment, MeetingData } from '@shared/models/meeting';
import { mockUsers } from './user';

// Mock meeting comments - only store userId, get other info from mockUsers
export const mockMeetingComments: MeetingComment[] = [
  {
    id: '1',
    userId: '2', // Nguyen Van A (student)
    time: '8:11 AM',
    text: "I won't be able to attend class today due to illness."
  },
  {
    id: '2',
    userId: '1', // Ptdat (teacher)
    time: 'Yesterday',
    text: 'Emilia Thanks for let me know. Hope you go well soon!'
  },
  {
    id: '3',
    userId: '3', // Nguyen Van B (student)
    time: 'Yesterday',
    text: 'Thanks for the announcement about the assignment deadline extension!'
  },
  {
    id: '4',
    userId: '1', // Ptdat (teacher)
    time: '2 hours ago',
    text: 'Please make sure to review chapter 5 before our next meeting. There will be a quiz.'
  },
  {
    id: '5',
    userId: '2', // Nguyen Van A (student)
    time: '1 hour ago',
    text: 'Can we get the presentation slides from today\'s meeting?'
  }
];

// Mock meeting data
export const mockMeetingData: MeetingData[] = [
  {
    id: 'meeting-1',
    topic: 'The final project report meeting in Teams',
    description: 'The final project report meeting in Teams will cover an in-depth review of our project outcomes, focusing on key accomplishments, challenges, and future recommendations. Each team member will present their contributions, followed by a Q&A session for feedback and clarifications. The meeting will conclude with a discussion on next steps and final documentation handover.',
    meetingDate: new Date('2024-12-07T13:00:00'), // Saturday, December 7, 2024 1:00 PM
    meetingUrl: 'https://zoom.us/j/1234567890',
    isActive: true,
    comments: mockMeetingComments
  },
  {
    id: 'meeting-2',
    topic: 'Physics Laboratory Session',
    description: 'Hands-on physics experiments and discussion',
    meetingDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    isActive: true,
    comments: mockMeetingComments.slice(0, 3)
  },
  {
    id: 'meeting-3',
    topic: 'Chemistry Discussion Group',
    description: 'Group discussion on organic chemistry topics',
    meetingDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (past meeting)
    isActive: false,
    comments: mockMeetingComments.slice(1, 4)
  }
];

// Helper function to get user info by ID
export const getUserById = (userId: string) => {
  return mockUsers.find(user => user.id === userId);
};