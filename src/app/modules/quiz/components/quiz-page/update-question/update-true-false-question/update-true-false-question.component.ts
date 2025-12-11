import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import {
  Question,
  QuestionStatus,
  QuestionType,
  TrueFalseQuestion,
} from '@shared/models/question';
import {
  createTrueFalseQuestionAnswerFormControls,
  createTrueFalseQuestionGeneralFormControls,
} from '../../create-question/create-true-false-question/create-true-false-question-form.config';
import { GetQuestion, UpdateQuestion } from '@modules/quiz/api/question.api';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

@Component({
  selector: 'update-true-false-question',
  standalone: false,
  templateUrl: './update-true-false-question.component.html',
  styleUrl: './update-true-false-question.component.scss',
  providers: [CollapsibleListService],
})
export class UpdateTrueFalseQuestionComponent {
  question: Question | null = null;
  courseId: string = '';
  sectionIds: string[] = ['general', 'answer'];
  showPassword = false;
  form!: FormGroup;
  generalFormControls = createTrueFalseQuestionGeneralFormControls;
  answerFormControls = createTrueFalseQuestionAnswerFormControls;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private collapsibleListService: CollapsibleListService,
    private activedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private location: Location
  ) {}

  initForm(question: Question): void {
    const questionData = question.data as TrueFalseQuestion;
    this.form = this.fb.group({
      questionName: new FormControl<string>(question.questionName, [
        Validators.required,
        Validators.minLength(2),
      ]),
      questionText: new FormControl<string>(question.questionText, [
        Validators.required,
        Validators.minLength(2),
      ]),
      status: new FormControl<QuestionStatus>(question.status, [
        Validators.required,
      ]),
      defaultMark: new FormControl<number>(question.defaultMark, [
        Validators.required,
        Validators.min(0),
      ]),
      correctAnswer: new FormControl<boolean>(
        questionData?.correctAnswer ?? true,
        []
      ),
      feedbackOfTrue: new FormControl<string>(
        questionData?.feedbackOfTrue ?? '',
        []
      ),
      feedbackOfFalse: new FormControl<string>(
        questionData?.feedbackOfFalse ?? '',
        []
      ),
    });
  }

  ngOnInit(): void {
    this.courseId = this.activedRoute.snapshot.paramMap.get('courseId') ?? '';
    const questionId = this.activedRoute.snapshot.paramMap.get('questionId');
    if (!questionId) {
      this.toastrService.error('Question ID is required for update.');
      this.location.back();
      return;
    }
    this.fetchQuestionData(questionId);
    this.collapsibleListService.setSectionIds(this.sectionIds);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.expandAll();
  }

  async fetchQuestionData(id: string) {
    await GetQuestion(id)
      .then((question) => {
        this.question = question;
        this.initForm(question);
      })
      .catch((error) => {
        console.error('Failed to fetch question:', error);
        this.toastrService.error('Failed to fetch question data.');
        this.location.back();
      });
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    // Force blur on active element to ensure value is synced
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstInvalidControl: HTMLElement = document.querySelector(
        'form .ng-invalid'
      ) as HTMLElement;
      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        firstInvalidControl.focus();
      }
      return;
    }

    const updatedQuestion: Question = {
      ...this.question!,
      type: QuestionType.TRUE_FALSE,
      questionName: this.form.get('questionName')?.value ?? '',
      questionText: this.form.get('questionText')?.value ?? '',
      status: this.form.get('status')?.value ?? QuestionStatus.READY,
      defaultMark: this.form.get('defaultMark')?.value ?? 0,
      data: {
        correctAnswer: this.form.get('correctAnswer')?.value ?? true,
        feedbackOfTrue: this.form.get('feedbackOfTrue')?.value ?? '',
        feedbackOfFalse: this.form.get('feedbackOfFalse')?.value ?? '',
      },
      modifiedAt: new Date().toISOString(),
    };

    this.loading = true;
    await UpdateQuestion(updatedQuestion, this.courseId)
      .then((question) => {
        this.toastrService.success('Question updated successfully!');
        this.location.back();
      })
      .catch((error) => {
        console.error('Error updating question:', error);
        this.toastrService.error(error.message);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onCancel() {
    this.location.back();
  }
}
