import { QuizStatus, StudentResponse } from '@shared/models/student-response';
import { mockUsers } from './user';

export const mockStudentResponses: StudentResponse[] = [
  {
    id: '1',
    studentId: mockUsers[1].id, // Changed from user '1' to user '2' (Nguyen Van A)
    topicId: '1',
    data: {
      status: QuizStatus.FINISHED,
      startedAt: new Date(2025, 3, 25, 17, 30, 0, 0).toISOString(),
      completedAt: new Date(2025, 3, 25, 18, 30, 0, 0).toISOString(),
      answers: [],
    },
  },
  {
    id: '2',
    studentId: mockUsers[1].id,
    topicId: '1',
    data: {
      status: QuizStatus.NOT_FINISHED,
      startedAt: new Date(2025, 3, 25, 10, 30, 0, 0).toISOString(),
      completedAt: new Date(2025, 3, 25, 11, 30, 0, 0).toISOString(),
      answers: [],
    },
  },  
  {
    id: '3',
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A for Practice Quiz (no due date)
    topicId: '11',
    data: {
      status: QuizStatus.NOT_FINISHED,
      startedAt: new Date(2025, 5, 20, 10, 0, 0, 0).toISOString(),
      completedAt: '',
      answers: [],
    },
  },
  {
    id: '4',
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A for Advanced Quiz (topic '9') - completed this week
    topicId: '9',
    data: {
      status: QuizStatus.FINISHED,
      startedAt: new Date(2025, 5, 18, 14, 0, 0, 0).toISOString(),
      completedAt: new Date(2025, 5, 18, 15, 30, 0, 0).toISOString(),
      answers: [],
    },
  },  
  {
    id: '5',
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A for Practice Quiz with no due date (topic '14') - completed
    topicId: '14',
    data: {
      status: QuizStatus.FINISHED,
      startedAt: new Date(2025, 5, 17, 9, 0, 0, 0).toISOString(),
      completedAt: new Date(2025, 5, 17, 10, 15, 0, 0).toISOString(),
      answers: [],
    },
  },
  {
    id: '6',
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A for This Week Quiz (topic '16') - completed this week
    topicId: '16',
    data: {
      status: QuizStatus.FINISHED,
      startedAt: new Date(2025, 5, 19, 14, 30, 0, 0).toISOString(),
      completedAt: new Date(2025, 5, 19, 15, 15, 0, 0).toISOString(),
      answers: [],
    },
  },
];

export const mockAssignmentResponses: StudentResponse[] = [
  {
    id: '1',
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A
    topicId: '2',
    data: {
      submittedAt: new Date(2024, 11, 10, 12, 30, 0, 0).toISOString(),
      files: [
        {
          id: '1',
          name: 'Final_Project_NguyenVanA.pdf',
          displayUrl: 'https://example.com/file1.pdf',
          downloadUrl: 'https://example.com/file1.pdf',
        },
      ],
      mark: 85,
      note: 'Great work!',
    },
  },
  {
    id: '2',
    studentId: mockUsers[2].id,
    topicId: '2',
    data: {
      submittedAt: new Date(2024, 11, 10, 13, 30, 0, 0).toISOString(),
      files: [
        {
          id: '2',
          name: 'Assignment_NguyenVanB.pdf',
          displayUrl: 'https://example.com/file2.pdf',
          downloadUrl: 'https://example.com/file2.pdf',
        },
      ],
      mark: 72,
      note: 'Good effort, needs more detail',
    },
  },
  {
    id: '3',
    studentId: mockUsers[1].id,
    topicId: '2',
    data: {
      submittedAt: new Date(2024, 11, 10, 14, 15, 0, 0).toISOString(),
      files: [],
      mark: null,
      note: 'Submitted but not graded yet',
    },
  },  {
    id: '4',
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A for Additional project (topic '8')
    topicId: '8',
    data: {
      submittedAt: new Date(2024, 11, 10, 13, 45, 0, 0).toISOString(),
      files: [],
      mark: null,
      note: 'Submitted late',
    },
  },
  {
    id: '5',
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A for Music Theory Quiz (topic '12') - completed early 
    topicId: '12',
    data: {
      submittedAt: new Date(2025, 5, 15, 10, 0, 0, 0).toISOString(), // submitted before due date
      files: [],
      mark: 92,
      note: 'Excellent work, submitted early!',
    },
  },  {
    id: '6', 
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A for History Quiz (topic '13') - completed last week
    topicId: '13',
    data: {
      submittedAt: new Date(2025, 5, 12, 16, 0, 0, 0).toISOString(), // submitted last week
      files: [],
      mark: 88,
      note: 'Good understanding of the material',
    },
  },
  {
    id: '7',
    studentId: mockUsers[1].id, // Student ID '2' - Nguyen Van A for Old Assignment (topic '17') - completed sooner
    topicId: '17',
    data: {
      submittedAt: new Date(2025, 4, 30, 14, 0, 0, 0).toISOString(), // submitted in May (sooner)
      files: [],
      mark: 90,
      note: 'Excellent work on this earlier assignment',
    },
  },
];
