import { Course } from "./course";

export type Enrollment = {
  courseId: string;
};

export enum Role {
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  role: Role;
  enrollments?: Enrollment[];
};
