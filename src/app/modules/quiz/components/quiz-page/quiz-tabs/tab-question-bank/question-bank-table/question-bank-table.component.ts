import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { questionIconMap } from '@modules/quiz/constants/quiz.constant';
import { getQuestionBank } from '@modules/quiz/api/question.api';
import {
  Question,
  QuestionStatus,
  QuestionType,
} from '@shared/models/question';
import { User } from '@shared/models/user';
import { DialogService } from '@shared/services/dialog.service';
import { format } from 'date-fns';
import { CreateQuestionDialogData } from '../create-question-dialog/create-question-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { QuizTopic } from '@shared/models/topic';
import { ToastrService } from 'ngx-toastr';
import { UpdateTopic } from '@modules/courses/api/topic.api';

export type QuestionElement = {
  index: number;
  id: string;
  type: QuestionType;
  name: string;
  defaultMark: number;
  status: QuestionStatus;
  usage: number;
  modifiedBy: User;
  modifiedAt: Date;
};

@Component({
  selector: 'question-bank-table',
  standalone: false,
  templateUrl: './question-bank-table.component.html',
  styleUrl: './question-bank-table.component.scss',
})
export class QuestionBankTableComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) topic!: QuizTopic;
  @Output() topicChange = new EventEmitter<QuizTopic>();
  questions: Question[] = [];
  courseId: string = '';
  displayedColumns: string[] = [
    'index',
    'type',
    'name',
    'defaultMark',
    'status',
    'usage',
    'modifiedBy',
    'modifiedAt',
    'actions',
  ];
  dataSource = new MatTableDataSource<QuestionElement>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialogService: DialogService<CreateQuestionDialogData>,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    getQuestionBank(this.courseId).then((questions) => {
      this.questions = questions && Array.isArray(questions) ? questions : [];
      const elements = this.convertQuestionsToQuestionElements(this.questions);
      this.dataSource.data = elements;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
    this.dialogService.setCancelAction(() => this.onCancelCreateQuestion());
    this.dialogService.setConfirmAction(() => this.onConfirmCreateQuestion());
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  convertQuestionsToQuestionElements(questions: Question[]): QuestionElement[] {
    return questions.map((question, index) => {
      return {
        index: index + 1,
        id: question.id,
        type: question.type,
        name: question.questionName,
        defaultMark: question.defaultMark,
        status: question.status,
        usage: question.usage,
        modifiedBy: question.modifiedBy,
        modifiedAt: new Date(question.modifiedAt),
      };
    });
  }

  getQuestionIconType(type: QuestionType): string {
    return questionIconMap[type];
  }

  formatDate(date: Date): string {
    const pattern = 'MM/dd/yyyy';
    return format(date, pattern);
  }

  onCreateQuestion(): void {
    this.dialogService.openDialog();
  }

  onCancelCreateQuestion(): void {
    this.dialogService.closeDialog();
  }

  onConfirmCreateQuestion(): void {
    const data = this.dialogService.getData();
    if (data) {
      let type = 'choice';
      if (data.questionType === QuestionType.SHORT_ANSWER)
        type = 'short-answer';
      else if (data.questionType === QuestionType.TRUE_FALSE)
        type = 'true-false';
      this.router.navigate([
        `courses/${this.courseId}/question/${type}/create`,
      ]);
    }
    this.dialogService.closeDialog();
  }

  onAddToQuiz(questionId: string) {
    const questionToAdd = this.questions.find(
      (question) => question.id === questionId
    );
    if (!questionToAdd) {
      this.toastrService.error('Question not found in the question bank.');
      return;
    }
    const updatedQuiz: QuizTopic = {
      ...this.topic,
      data: {
        ...this.topic.data,
        questions: [...this.topic.data.questions, questionToAdd],
      },
    };
    this.topicChange.emit(updatedQuiz);
  }
}
