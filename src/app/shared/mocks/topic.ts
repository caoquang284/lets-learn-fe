import { Topic, TopicType } from '@shared/models/topic';
import { mockQuiz } from './quiz';
import { mockAssignment } from './assignment';
import { mockPage } from './page';
import { FileSizeOption } from '@shared/models/assignment';
import { GradingMethod, TimeLimitType } from '@shared/models/quiz';
import { mockQuestions } from './question';

export const mockTopics: Topic[] = [
  mockQuiz,
  mockAssignment,
  {
    id: '3',
    sectionId: '1',
    type: TopicType.MEETING,
    title: 'Topic Meeting',
    data: {
      id: 'meeting-3',
      topic: 'Topic Meeting',
      description: 'Meeting description',
      meetingDate: new Date(),
      meetingUrl: 'https://zoom.us/j/1234567890',
      isActive: true,
      comments: []
    },
  },
  {
    id: '4',
    sectionId: '1',
    type: TopicType.LINK,
    title: 'Topic Link',
    data: {
      description: 'Link description',
      url: 'https://www.google.com',
    },
  },
  {
    id: '5',
    sectionId: '1',
    type: TopicType.FILE,
    title: 'PMBOK book',
    data: {
      description: 'PMBOK description',
      file: {
        id: '1',
        name: 'PMBOK',
        downloadUrl: 'https://www.google.com',
        displayUrl: 'https://www.google.com',
      },
    },
  },
  mockPage,
  {
    id: '7',
    sectionId: '2',
    type: TopicType.FILE,
    title: 'Astronomy Conception',
    data: {
      description: 'PMBOK description',
      file: {
        id: '1',
        name: 'PMBOK',
        downloadUrl: 'https://www.google.com',
        displayUrl: 'https://www.google.com',
      },
    },
  },
  {
    id: '8',
    title: 'Additional project',
    sectionId: '2',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date(2024, 11, 10, 10, 30, 0, 0).toISOString(),
      close: new Date(2024, 11, 10, 14, 30, 0, 0).toISOString(),
      description:
        'Write a minimum of 500 words on what you would need to take into consideration if you were to spend a night in the Alps. Justify your choices.',
      remindToGrade: new Date(2024, 11, 10, 10, 30, 0, 0).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },
  // Additional assignments and quizzes for testing different due date categories
  {
    id: '9',
    title: 'Math Homework - This Week',
    sectionId: '1',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2 days (this week)
      description: 'Complete the math exercises from chapter 3.',
      remindToGrade: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: '10',
    title: 'Science Quiz - Next Week',
    sectionId: '1',
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Due in 10 days (next week)
      description: 'Quiz covering basic science concepts.',
      timeLimit: 60,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 7,
      gradingMethod: GradingMethod.HIGHEST_GRADE,
      attemptAllowed: '3',
      questions: mockQuestions.slice(0, 3),
    },
  },
  {
    id: '11',
    title: 'Practice Quiz - No Due Date',
    sectionId: '1',
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: null, // No due date
      description: 'Practice quiz for self-assessment.',
      timeLimit: null,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 5,
      gradingMethod: GradingMethod.FIRST_GRADE,
      attemptAllowed: 'Unlimited',
      questions: mockQuestions.slice(3, 5),
    },
  },  {
    id: '12',
    title: 'Music Theory Assignment',
    sectionId: '2',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(2025, 5, 25, 23, 59, 59, 999).toISOString(), // Due June 25th (future - for complete early testing)
      description: 'Complete the music theory worksheet on scales and modes.',
      remindToGrade: new Date(2025, 5, 27, 23, 59, 59, 999).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },
  {
    id: '13',
    title: 'History Essay',
    sectionId: '1',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(2025, 5, 13, 23, 59, 59, 999).toISOString(), // Due June 13th (last week)
      description: 'Write an essay on the causes of World War I.',
      remindToGrade: new Date(2025, 5, 15, 23, 59, 59, 999).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },
  {
    id: '14',
    title: 'Practice Quiz - No Due Date',
    sectionId: '2',
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: null, // No due date
      description: 'Practice quiz for additional learning.',
      timeLimit: 45,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 7,
      gradingMethod: GradingMethod.HIGHEST_GRADE,
      attemptAllowed: 'Unlimited',
      questions: mockQuestions.slice(0, 3),
    },  },
  {
    id: '15',
    title: 'Programming Assignment - No Due Date',
    sectionId: '2',
    type: TopicType.ASSIGNMENT,    
    data: {
      open: new Date().toISOString(),
      close: null, // No due date
      description: 'Create a simple web application using React.',
      remindToGrade: null,
      maximumFile: 5,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: '16',
    title: 'This Week Quiz',
    sectionId: '1',
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: new Date(2025, 5, 22, 23, 59, 59, 999).toISOString(), // Due June 22nd (this week)
      description: 'Quiz on current week material.',
      timeLimit: 30,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 6,
      gradingMethod: GradingMethod.LAST_GRADE,
      attemptAllowed: '2',
      questions: mockQuestions.slice(0, 3),
    },
  },
  {
    id: '17',
    title: 'Old Assignment',
    sectionId: '2',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(2025, 5, 1, 23, 59, 59, 999).toISOString(), // Due June 1st (sooner)
      description: 'An assignment from earlier in the semester.',
      remindToGrade: new Date(2025, 5, 3, 23, 59, 59, 999).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },
    // Computer Science Course (courseId: '2') assignments and quizzes
  {
    id: '18',
    title: 'Python Basics Assignment',
    sectionId: '4', // Programming Fundamentals section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Due in 4 days (this week)
      description: 'Write Python programs to solve basic algorithmic problems.',
      remindToGrade: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 2,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },
  {
    id: '17',
    title: 'Data Structures Quiz',
    sectionId: '5', // Data Structures section
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // Due in 8 days (next week)
      description: 'Quiz on arrays, linked lists, and binary trees.',
      timeLimit: 45,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 6,
      gradingMethod: GradingMethod.HIGHEST_GRADE,
      attemptAllowed: '2',
      questions: mockQuestions.slice(1, 4),
    },
  },
  {
    id: '18',
    title: 'Algorithm Implementation Project',
    sectionId: '5', // Data Structures section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // Due in 21 days (later)
      description: 'Implement sorting algorithms and analyze their complexity.',
      remindToGrade: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 3,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: '19',
    title: 'Programming Fundamentals Test',
    sectionId: '4', // Programming Fundamentals section
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: null, // No due date
      description: 'Practice test for programming concepts.',
      timeLimit: null,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 5,
      gradingMethod: GradingMethod.FIRST_GRADE,
      attemptAllowed: 'Unlimited',
      questions: mockQuestions.slice(2, 5),
    },
  },

  // Engineering Course (courseId: '3') assignments and quizzes
  {
    id: '20',
    title: 'Engineering Design Report',
    sectionId: '6', // Engineering Principles section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Due in 5 days (this week)
      description: 'Design and document an engineering solution for a real-world problem.',
      remindToGrade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 4,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: '21',
    title: 'Project Management Quiz',
    sectionId: '7', // Project Management section
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // Due in 9 days (next week)
      description: 'Quiz on project planning and management methodologies.',
      timeLimit: 30,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 7,
      gradingMethod: GradingMethod.LAST_GRADE,
      attemptAllowed: '3',
      questions: mockQuestions.slice(0, 3),
    },
  },
  {
    id: '22',
    title: 'Capstone Project Proposal',
    sectionId: '7', // Project Management section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // Due in 35 days (later)
      description: 'Submit a detailed proposal for your capstone engineering project.',
      remindToGrade: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 2,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: '23',
    title: 'Engineering Ethics Discussion',
    sectionId: '6', // Engineering Principles section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: null, // No due date
      description: 'Participate in online discussion about engineering ethics cases.',
      remindToGrade: null,
      maximumFile: 1,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },

  // Filming Course (courseId: '4') assignments and quizzes
  {
    id: '24',
    title: 'Camera Techniques Assignment',
    sectionId: '8', // Camera Basics section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // Due in 6 days (this week)
      description: 'Create a short video demonstrating various camera techniques.',
      remindToGrade: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: '25',
    title: 'Film Theory Quiz',
    sectionId: '8', // Camera Basics section
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(), // Due in 11 days (next week)
      description: 'Quiz on basic film theory and cinematography principles.',
      timeLimit: 40,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 6,
      gradingMethod: GradingMethod.HIGHEST_GRADE,
      attemptAllowed: '2',
      questions: mockQuestions.slice(1, 4),
    },
  },
  {
    id: '26',
    title: 'Final Film Project',
    sectionId: '9', // Post-Production section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), // Due in 28 days (later)
      description: 'Create, film, and edit a complete short film project.',
      remindToGrade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 2,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: '27',
    title: 'Video Editing Practice',
    sectionId: '9', // Post-Production section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: null, // No due date
      description: 'Practice video editing techniques using provided footage.',
      remindToGrade: null,      maximumFile: 3,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },

  // Music Course (courseId: '5') assignments and quizzes
  {
    id: '28',
    title: 'Music Theory Fundamentals Quiz',
    sectionId: '10', // Music Theory section
    type: TopicType.QUIZ,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Due in 3 days (this week)
      description: 'Quiz on basic music theory concepts including scales and chords.',
      timeLimit: 30,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 7,
      gradingMethod: GradingMethod.HIGHEST_GRADE,
      attemptAllowed: '2',
      questions: mockQuestions.slice(0, 3),
    },
  },
  {
    id: '29',
    title: 'Composition Assignment',
    sectionId: '11', // Composition section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Due in 14 days (next week)
      description: 'Compose a short piece of music (2-3 minutes) in any style.',
      remindToGrade: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 2,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: '30',
    title: 'Music History Research',
    sectionId: '10', // Music Theory section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // Due in 25 days (later)
      description: 'Research and write about the development of jazz music.',
      remindToGrade: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },  
  {
    id: '31',
    title: 'Practice Exercises',
    sectionId: '11', // Composition section
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date().toISOString(),
      close: null, // No due date
      description: 'Complete daily practice exercises for music composition.',
      remindToGrade: null,
      maximumFile: 5,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },
  // OVERDUE ITEMS FOR TESTING TAB-OVERDUE COMPONENT
  // This Week Overdue (due 2 days ago)
  {
    id: 'overdue-1',
    title: 'Math Assignment - Overdue This Week',
    sectionId: '1',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      close: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Due 2 days ago
      description: 'Complete algebra problems from chapter 5.',
      remindToGrade: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: 'overdue-2',
    title: 'Biology Quiz - Overdue This Week',
    sectionId: '1',
    type: TopicType.QUIZ,
    data: {
      open: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      close: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Due 1 day ago
      description: 'Quiz on cell biology and molecular structures.',
      timeLimit: 45,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 7,
      gradingMethod: GradingMethod.HIGHEST_GRADE,
      attemptAllowed: '2',
      questions: mockQuestions.slice(0, 5),
    },
  },
  // Last Week Overdue (due 8-10 days ago)
  {
    id: 'overdue-3',
    title: 'Chemistry Lab Report - Overdue Last Week',
    sectionId: '2',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      close: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // Due 8 days ago
      description: 'Submit lab report on chemical reactions experiment.',
      remindToGrade: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 2,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: 'overdue-4',
    title: 'Physics Problem Set - Overdue Last Week',
    sectionId: '2',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      close: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Due 10 days ago
      description: 'Solve problems related to thermodynamics.',
      remindToGrade: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['5MB'],
    },
  },
  // Sooner Overdue (due 20+ days ago)
  {
    id: 'overdue-5',
    title: 'Literature Essay - Overdue Weeks Ago',
    sectionId: '1',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      close: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // Due 20 days ago
      description: 'Write an analysis of Shakespeare\'s Hamlet.',
      remindToGrade: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 1,
      maximumFileSize: FileSizeOption['10MB'],
    },
  },
  {
    id: 'overdue-6',
    title: 'Economics Quiz - Very Overdue',
    sectionId: '2',
    type: TopicType.QUIZ,
    data: {
      open: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      close: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // Due 25 days ago
      description: 'Quiz on supply and demand principles.',
      timeLimit: 30,
      timeLimitUnit: TimeLimitType.MINUTES,
      gradeToPass: 6,
      gradingMethod: GradingMethod.AVERAGE_GRADE,
      attemptAllowed: '1',
      questions: mockQuestions.slice(5, 8),
    },
  },
  {
    id: 'overdue-7',
    title: 'Programming Project - Very Overdue',
    sectionId: '1',
    type: TopicType.ASSIGNMENT,
    data: {
      open: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      close: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Due 30 days ago
      description: 'Create a web application using HTML, CSS, and JavaScript.',
      remindToGrade: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      maximumFile: 5,
      maximumFileSize: FileSizeOption['10MB'],
    },
  }
];
