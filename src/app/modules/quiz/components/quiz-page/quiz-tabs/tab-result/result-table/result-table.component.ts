import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { getDurationText } from '@shared/helper/date.helper';
import {
  QuizResponseData,
  StudentResponse,
} from '@shared/models/student-response';
import { StudentResponseService } from '@shared/services/student-response.service';
import { GetAllQuizResponsesOfTopic } from '../../../../../api/quiz-response.api';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export type ResultElement = {
  index: number;
  image: string;
  name: string;
  email: string;
  duration: string;
  grade: number;
};

@Component({
  selector: 'result-table',
  standalone: false,
  templateUrl: './result-table.component.html',
  styleUrl: './result-table.component.scss',
})
export class ResultTableComponent implements OnInit, AfterViewInit {
  @Input() topicId!: string;
  studentResponses: StudentResponse[] = [];
  displayedColumns: string[] = [
    'index',
    'image',
    'name',
    'email',
    'duration',
    'grade',
  ];
  dataSource = new MatTableDataSource<ResultElement>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private studentResponseService: StudentResponseService) {}

  ngOnInit(): void {
    if (!this.topicId) {
      this.studentResponses = [];
      this.dataSource.data = [];
      return;
    }
    GetAllQuizResponsesOfTopic(this.topicId)
      .then((responses: StudentResponse[] = []) => {
        this.studentResponses = Array.isArray(responses) ? responses : [];
        const elements = this.convertStudentResponsesToResultElements(this.studentResponses);
        this.dataSource.data = elements;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      })
      .catch(() => {
        this.studentResponses = [];
        this.dataSource.data = [];
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  convertStudentResponsesToResultElements(
    responses: StudentResponse[]
  ): ResultElement[] {
    const converted: ResultElement[] = responses.map((response, index) => {
      const studentId = response.studentId;
      const data = response.data as QuizResponseData;
      const duration = getDurationText(data.startedAt, data.completedAt);
      const score = this.studentResponseService.getQuizResponseMark(data);
      return {
        index: index + 1,
        image: '', // TODO: Fetch student avatar from studentId
        name: `Student ${studentId}`, // TODO: Fetch student name from studentId
        email: '', // TODO: Fetch student email from studentId
        duration: duration,
        grade: score,
      };
    });
    return converted;
  }
}
