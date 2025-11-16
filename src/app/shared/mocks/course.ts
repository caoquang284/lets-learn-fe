import { Course } from '@shared/models/course';
import { Role } from '@shared/models/user';
import { mockSections } from './section';
import { mockCategories } from './category';
import { mockUsers } from './user';

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Accounting',
    category: mockCategories[0],
    sections: mockSections.filter((section) => section.courseId === '1'),
    description:
      'This is a course that introduces you to the basics of accounting.',
    imageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWNjb3VudGluZ3xlbnwwfDB8MHx8fDI%3D',
    price: 79.99,
    level: 'Beginner',
    students: [mockUsers[1], mockUsers[2]], // Nguyen Van A (user '2') is enrolled
    creator: {
      id: '1',
      username: 'John Doe',
      email: '',
      avatar: 'https://www.law.columbia.edu/sites/default/files/2020-05/20200402_gillianmetzger_001_profile.jpg',
      password: '',
      role: Role.TEACHER,
    },
    isPublished: true,
  },
  {
    id: '2',
    title: 'Introduction to Computer Science',
    category: mockCategories[1],
    sections: mockSections.filter((section) => section.courseId === '2'),
    description:
      'This is a course that introduces you to the basics of computer science.',
    imageUrl:
      'https://images.unsplash.com/photo-1675495666895-9091741bfd78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNvbXB1dGVyJTIwc2NpZW5jZXxlbnwwfDB8MHx8fDI%3D',    price: 59.99,
    level: 'Beginner',
    students: [mockUsers[1]], // Nguyen Van A (user '2') is enrolled in Computer Science
    creator: {
      id: '1',
      username: 'John Doe',
      email: '',
      avatar: 'https://www.law.columbia.edu/sites/default/files/2020-05/20200402_gillianmetzger_001_profile.jpg',
      password: '',
      role: Role.TEACHER,
    },
    isPublished: true,
  },
  {
    id: '3',
    title: 'Introduction to Engineering',
    category: mockCategories[2],
    sections: mockSections.filter((section) => section.courseId === '3'),
    description:
      'This is a course that introduces you to the basics of engineering.',
    imageUrl:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZW5naW5lZXJpbmd8ZW58MHwwfDB8fHwy',
    price: 99.99,
    level: 'Beginner',
    students: [],
    creator: {
      id: '1',
      username: 'John Doe',
      email: '',
      avatar: 'https://www.law.columbia.edu/sites/default/files/2020-05/20200402_gillianmetzger_001_profile.jpg',
      password: '',
      role: Role.TEACHER,
    },
    isPublished: true,
  },
  {
    id: '4',
    title: 'Introduction to Filming',
    category: mockCategories[3],
    sections: mockSections.filter((section) => section.courseId === '4'),
    description:
      'This is a course that introduces you to the basics of filming.',
    imageUrl:
      'https://images.unsplash.com/photo-1500705479396-0e1d0bee4076?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZmlsbWluZ3xlbnwwfDB8MHx8fDI%3D',
    price: 12.49,
    level: 'Beginner',
    students: [],
    creator: {
      id: '1',
      username: 'John Doe',
      email: '',
      avatar: 'https://www.law.columbia.edu/sites/default/files/2020-05/20200402_gillianmetzger_001_profile.jpg',
      password: '',
      role: Role.TEACHER,
    },
    isPublished: true,
  },
  {
    id: '5',
    title: 'Introduction to Music',
    category: mockCategories[4],
    sections: mockSections.filter((section) => section.courseId === '5'),
    description: 'This is a course that introduces you to the basics of music.',
    imageUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bXVzaWN8ZW58MHwwfDB8fHwy',    price: 29.99,
    level: 'Beginner',
    students: [mockUsers[1]], // Nguyen Van A (user '2') is enrolled in Music
    creator: {
      id: '1',
      username: 'John Doe',
      email: '',
      avatar: 'https://www.law.columbia.edu/sites/default/files/2020-05/20200402_gillianmetzger_001_profile.jpg',
      password: '',
      role: Role.TEACHER,
    },
    isPublished: true,
  },
];
