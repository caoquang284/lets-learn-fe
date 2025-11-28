import { CloudinaryFile } from './cloudinary-file';
import { Question } from './question';
import { User } from './user';

export type StudentResponse = {
  id: string;
  studentId: string;
  topicId: string;
  data: QuizResponseData | AssignmentResponseData;
};

export type QuizResponseData = {
  status: QuizStatus;
  startedAt: string;
  completedAt: string;
  answers: QuizAnswer[];
};

// { question: "which is correct ?", answer: "1" -> index of answer, mark: 1 }
// { question: "which is correct ?", answer: "1001" -> index of answers, mark: 2 }
// { question: "which is correct ?", answer: "hello" -> answer string, mark: 0 }
export type QuizAnswer = {
  question: Question;
  answer: string;
  mark: number;
};

export enum QuizStatus {
  FINISHED = 'Finished',
  NOT_FINISHED = 'Not finished',
  NOT_STARTED = 'Not started',
}

export type AssignmentResponseData = {
  submittedAt: string;
  files: CloudinaryFile[];
  mark: number | null;
  note: string;
};
