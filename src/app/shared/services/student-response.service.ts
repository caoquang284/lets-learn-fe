import { Injectable } from '@angular/core';
import {
  QuizResponseData,
  QuizStatus,
  StudentResponse,
} from '@shared/models/student-response';
import { UserService } from './user.service';
import { User } from '@shared/models/user';

@Injectable({ providedIn: 'root' })
export class StudentResponseService {
  private user: User | null = null;
  constructor(private userService: UserService) {
    this.user = this.userService.getUser();
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  getQuizResponseMark = (quizResponse: QuizResponseData) => {
    let mark = 0;
    quizResponse.answers.forEach((answer) => {
      mark += answer.mark;
    });
    return mark;
  };

  getQuizResponseTotalMark = (quizResponse: QuizResponseData) => {
    let totalMark = 0;
    quizResponse.answers.forEach((answer) => {
      totalMark += answer.question.defaultMark;
    });
    return totalMark;
  };

  sortQuizResponsesByCompletedDate = (
    quizResponses: StudentResponse[],
    ascending = true
  ) => {
    return quizResponses.sort((a, b) => {
      const aData = a.data as QuizResponseData;
      const bData = b.data as QuizResponseData;
      if (ascending)
        return (
          new Date(aData.completedAt).getTime() -
          new Date(bData.completedAt).getTime()
        );
      return (
        new Date(bData.completedAt).getTime() -
        new Date(aData.completedAt).getTime()
      );
    });
  };

  getGradeColor = (grade: number, maxGrade: number) => {
    if (grade >= maxGrade * 0.8) return 'green';
    if (grade >= maxGrade * 0.5) return 'orange';
    return 'red';
  };

  getInitQuizResponse = (topicId: string): StudentResponse | null => {
    if (!this.user) return null;
    const quizResponseData: QuizResponseData = {
      status: QuizStatus.NOT_STARTED,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      answers: [],
    };
    const response: StudentResponse = {
      id: '',
      topicId,
      studentId: this.user.id,
      data: quizResponseData,
    };
    return response;
  };
}
