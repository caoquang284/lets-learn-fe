import { Role, User } from '@shared/models/user';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'Ptdat',
    email: 'ptdat@gmail.com',
    avatar:
      'https://images.unsplash.com/photo-1658281097220-eb7672eed00b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    password: '',
    role: Role.TEACHER,
  },
  {
    id: '2',
    username: 'Nguyen Van A',
    email: 'nva@gmail.com',
    avatar:
      'https://images.unsplash.com/photo-1658281097220-eb7672eed00b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    password: '',
    role: Role.STUDENT,
  },
  {
    id: '3',
    username: 'Nguyen Van B',
    email: 'nvb@gmail.com',
    avatar:
      'https://images.unsplash.com/photo-1658281097220-eb7672eed00b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    password: '',
    role: Role.STUDENT,
  },
];
