import { ReviewItem } from '../../modules/to-review/constants/to-review.constants';
import { TopicType } from '@shared/models/topic';
import { mockTopics } from '@shared/mocks/topic';
import { mockCourses } from '@shared/mocks/course';

// Mock review items data
export const mockReviewItems: ReviewItem[] = [
  {
    id: '1',
    title: 'Math Quiz Chapter 1',
    course: 'Advanced Mathematics',
    type: TopicType.QUIZ,
    graded: 15,
    submitted: 20,
    assigned: 25,
    icon: 'quiz',
    topic: {
      ...mockTopics.find(t => t.type === TopicType.QUIZ)!,
      id: '1',
      title: 'Math Quiz Chapter 1',
      course: mockCourses[0],
      data: {
        ...mockTopics.find(t => t.type === TopicType.QUIZ)!.data,
        open: new Date().toISOString(),
        close: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }
    }
  },
  {
    id: '2', 
    title: 'Physics Assignment 1',
    course: 'Physics Fundamentals',
    type: TopicType.ASSIGNMENT,
    graded: 8,
    submitted: 12,
    assigned: 20,
    icon: 'assignment',
    topic: {
      ...mockTopics.find(t => t.type === TopicType.ASSIGNMENT)!,
      id: '2',
      title: 'Physics Assignment 1',
      course: mockCourses[1] || mockCourses[0],
      data: {
        ...mockTopics.find(t => t.type === TopicType.ASSIGNMENT)!.data,
        open: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        close: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago (closed)
      }
    }
  },
  {
    id: '3',
    title: 'Chemistry Lab Report',
    course: 'Chemistry Basics',
    type: TopicType.ASSIGNMENT,
    graded: 5,
    submitted: 18,
    assigned: 22,
    icon: 'assignment',
    topic: {
      ...mockTopics.find(t => t.type === TopicType.ASSIGNMENT)!,
      id: '3',
      title: 'Chemistry Lab Report',
      course: {
        id: 'chem-course',
        title: 'Chemistry Basics',
        description: 'Introduction to Chemistry',
        imageUrl: '',
        price: 0,
        category: 'Science',
        level: 'Beginner',
        students: Array(22).fill(null).map((_, i) => ({ id: `student-${i}`, username: `student${i}`, email: `student${i}@example.com`, password: '', avatar: '', role: 'STUDENT' as any })),
        creator: { id: 'teacher-1', username: 'teacher1', email: 'teacher1@example.com', password: '', avatar: '', role: 'TEACHER' as any },
        sections: [],
        isPublished: true
      },
      data: {
        ...mockTopics.find(t => t.type === TopicType.ASSIGNMENT)!.data,
        open: new Date().toISOString(),
        close: null // No due date
      }
    }
  },
  {
    id: '4',
    title: 'History Final Exam',
    course: 'World History',
    type: TopicType.QUIZ,
    graded: 0,
    submitted: 8,
    assigned: 30,
    icon: 'quiz',
    topic: {
      ...mockTopics.find(t => t.type === TopicType.QUIZ)!,
      id: '4',
      title: 'History Final Exam',
      course: {
        id: 'history-course',
        title: 'World History',
        description: 'Comprehensive World History Course',
        imageUrl: '',
        price: 0,
        category: 'History',
        level: 'Intermediate',
        students: Array(30).fill(null).map((_, i) => ({ id: `student-${i}`, username: `student${i}`, email: `student${i}@example.com`, password: '', avatar: '', role: 'STUDENT' as any })),
        creator: { id: 'teacher-2', username: 'teacher2', email: 'teacher2@example.com', password: '', avatar: '', role: 'TEACHER' as any },
        sections: [],
        isPublished: true
      },
      data: {
        ...mockTopics.find(t => t.type === TopicType.QUIZ)!.data,
        open: new Date().toISOString(),
        close: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now (work in progress)
      }
    }
  },
  {
    id: '5',
    title: 'Programming Project',
    course: 'Computer Science 101',
    type: TopicType.ASSIGNMENT,
    graded: 12,
    submitted: 15,
    assigned: 18,
    icon: 'assignment',
    topic: {
      ...mockTopics.find(t => t.type === TopicType.ASSIGNMENT)!,
      id: '5',
      title: 'Programming Project',
      course: {
        id: 'cs-course',
        title: 'Computer Science 101',
        description: 'Introduction to Programming',
        imageUrl: '',
        price: 0,
        category: 'Technology',
        level: 'Beginner',
        students: Array(18).fill(null).map((_, i) => ({ id: `student-${i}`, username: `student${i}`, email: `student${i}@example.com`, password: '', avatar: '', role: 'STUDENT' as any })),
        creator: { id: 'teacher-3', username: 'teacher3', email: 'teacher3@example.com', password: '', avatar: '', role: 'TEACHER' as any },
        sections: [],
        isPublished: true
      },
      data: {
        ...mockTopics.find(t => t.type === TopicType.ASSIGNMENT)!.data,
        open: new Date().toISOString(),
        close: null // No due date
      }
    }
  }
];