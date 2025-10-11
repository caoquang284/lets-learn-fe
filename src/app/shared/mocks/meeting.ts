import { MeetingComment, MeetingData } from '@shared/models/meeting';

// Mock meeting comments
export const mockMeetingComments: MeetingComment[] = [
  {
    id: '1',
    author: 'Emilia Clarke',
    time: '8:11 AM',
    text: "I won't be able to attend class today due to illness. Could you please record the session?",
    avatar: '/public/images/mock-user-image.jpg',
    userId: 'user-1'
  },
  {
    id: '2',
    author: 'John Doe',
    time: 'Yesterday',
    text: 'Hope you get well soon! The materials from today will be shared after class.',
    avatar: 'https://via.placeholder.com/40/4CAF50/FFFFFF?text=JD',
    userId: 'user-2'
  },
  {
    id: '3',
    author: 'Sarah Wilson',
    time: 'Yesterday',
    text: 'Thanks for the announcement about the assignment deadline extension!',
    avatar: 'https://via.placeholder.com/40/2196F3/FFFFFF?text=SW',
    userId: 'user-3'
  },
  {
    id: '4',
    author: 'Dr. Smith (Teacher)',
    time: '2 hours ago',
    text: 'Please make sure to review chapter 5 before our next meeting. There will be a quiz.',
    avatar: 'https://via.placeholder.com/40/FF9800/FFFFFF?text=DS',
    userId: 'teacher-1'
  },
  {
    id: '5',
    author: 'Mike Johnson',
    time: '1 hour ago',
    text: 'Can we get the presentation slides from today\'s meeting?',
    avatar: 'https://via.placeholder.com/40/9C27B0/FFFFFF?text=MJ',
    userId: 'user-4'
  }
];

// Mock meeting data
export const mockMeetingData: MeetingData[] = [
  {
    id: 'meeting-1',
    topic: 'Advanced Mathematics - Calculus Review',
    description: 'Weekly calculus review session covering derivatives and integrals',
    meetingDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
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