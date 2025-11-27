import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
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
export class QuestionBankTableComponent implements OnInit, AfterViewInit, OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    // When topic input changes from parent, the component automatically gets the updated reference
    // This ensures we always work with the latest topic data including newly added questions
    if (changes['topic'] && !changes['topic'].firstChange) {
      // Topic has been updated by parent after API call
      // The binding will automatically update this.topic
    }
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
    
    // Check if question is already added to the quiz
    const alreadyExists = this.topic.data.questions.some(
      (q) => q.id === questionId
    );
    if (alreadyExists) {
      this.toastrService.warning('Question already added to this quiz.');
      return;
    }
    
    // Create a deep copy to ensure change detection triggers
    const updatedQuiz: QuizTopic = {
      ...this.topic,
      data: {
        ...this.topic.data,
        questions: [...this.topic.data.questions, { ...questionToAdd }],
      },
    };
    
    console.log('Emitting updated quiz with questions:', updatedQuiz.data.questions.length);
    this.topicChange.emit(updatedQuiz);
  }
}
