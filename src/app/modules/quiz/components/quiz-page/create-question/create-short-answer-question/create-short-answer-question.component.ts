import { Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CreateQuestion, GetQuestion } from '@modules/quiz/api/question.api';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { generateId } from '@shared/helper/string.helper';
import {
  Question,
  QuestionChoice,
  QuestionStatus,
  QuestionType,
  ShortAnswerQuestion,
} from '@shared/models/question';
import { ToastrService } from 'ngx-toastr';
import {
  createShortAnswerQuestionGeneralFormControls,
  getShortAnswerQuestionAnswerFormControls,
  getShortAnswersQuestionAnswersFormControls,
} from './create-short-answer-question-form.config';

@Component({
  selector: 'create-short-answer-question',
  standalone: false,
  templateUrl: './create-short-answer-question.component.html',
  styleUrl: './create-short-answer-question.component.scss',
  providers: [CollapsibleListService],
})
export class CreateShortAnswerQuestionComponent {
  question: Question | null = null;
  courseId: string = '';
  sectionIds: string[] = ['general', 'answer'];
  showPassword = false;
  form!: FormGroup;
  generalFormControls = createShortAnswerQuestionGeneralFormControls;
  answerFormControls = getShortAnswersQuestionAnswersFormControls(3);
  loading = false;

  constructor(
    private fb: FormBuilder,
    private collapsibleListService: CollapsibleListService,
    private activedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private location: Location
  ) {}

  initForm(question: Question | null): void {
    const questionData = question ? (question.data as ShortAnswerQuestion) : null;
    this.form = this.fb.group(
      {
        questionName: new FormControl<string>(question?.questionName ?? '', [
          Validators.required,
          Validators.minLength(2),
        ]),
        questionText: new FormControl<string>(question?.questionText ?? '', [
          Validators.required,
          Validators.minLength(2),
        ]),
        status: new FormControl<QuestionStatus>(
          question?.status ?? QuestionStatus.READY,
          [Validators.required]
        ),
        defaultMark: new FormControl<number>(question?.defaultMark ?? 1, [
          Validators.required,
          Validators.min(0),
        ]),
        answers: this.fb.array(
          questionData
            ? questionData.choices.map((choice) =>
                this.getAnswerFormGroup(choice)
              )
            : Array.from({ length: 3 }, (_, index) =>
                this.getDefaultAnswerFormGroup(index)
              ),
          Validators.required
        ),
      },
      { updateOn: 'submit' }
    );
  }

  getAnswerFormGroup(choice: QuestionChoice) {
    return this.fb.group({
      text: new FormControl<string>(choice.text, [
        Validators.required,
        Validators.minLength(1),
      ]),
      gradePercent: new FormControl<number>(choice.gradePercent, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]),
      feedback: new FormControl<string>(choice.feedback ?? ''),
    });
  }

  getDefaultAnswerFormGroup(index: number) {
    return this.fb.group({
      text: new FormControl<string>(`Answer ${index + 1}`, [
        Validators.required,
        Validators.minLength(1),
      ]),
      gradePercent: new FormControl<number>(0, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]),
      feedback: new FormControl<string>(''),
    });
  }

  getFormGroupFromForm(index: number): FormGroup {
    const answers = this.form.get('answers') as FormArray;
    if (answers && answers.length > index) {
      return answers.at(index) as FormGroup;
    }
    return this.getDefaultAnswerFormGroup(index);
  }

  addQuestionChoice() {
    const answers = this.form.get('answers') as FormArray;
    if (answers) {
      answers.push(this.getDefaultAnswerFormGroup(answers.length));
      this.answerFormControls = [
        ...this.answerFormControls,
        getShortAnswerQuestionAnswerFormControls(
          this.answerFormControls.length
        ),
      ];
    }
  }

  removeQuestionChoice() {
    const answers = this.form.get('answers') as FormArray;
    if (answers && answers.length > 1) {
      answers.removeAt(answers.length - 1);
      this.answerFormControls.pop();
    } else {
      this.toastrService.error(
        'You must have at least 1 choice for a short answer question.'
      );
    }
  }

  ngOnInit(): void {
    this.courseId = this.activedRoute.snapshot.paramMap.get('courseId') ?? '';
    const questionId = this.activedRoute.snapshot.paramMap.get('questionId');
    if (questionId) {
      this.fetchQuestionData(questionId);
    } else {
      this.initForm(this.question);
    }
    this.collapsibleListService.setSectionIds(this.sectionIds);
    this.collapsibleListService.setCanEdit(false); // disable edit UI in collapsible list
    this.collapsibleListService.expandAll();
  }

  async fetchQuestionData(id: string) {
    await GetQuestion(id)
      .then((question) => {
        console.log('Fetched question:', question);
        this.question = question;
        this.initForm(this.question);
      })
      .catch((error) => {
        console.error('Failed to fetch question:', error);
        this.toastrService.error('Failed to fetch question data.');
      });
  }

  checkValidGradePercents() {
    const answers = this.form.get('answers') as FormArray;
    if (!answers) return false;

    const answerWithFullGradePercent = answers.controls.findIndex(
      (control) => Number(control.get('gradePercent')?.value) === 100
    );
    if (answerWithFullGradePercent === -1) {
      this.toastrService.error(
        'At least one answer must have a grade percent of 100.'
      );
      return false;
    }
    return true;
  }

  async onSubmit(e: Event) {
    e.preventDefault(); // Prevent default form submission
    // Stop here if form is invalid
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Mark all controls as touched to show validation errors

      // Find first invalid control and scroll to it
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

    if (!this.checkValidGradePercents()) return;

    const answersArray = (this.form.get('answers') as FormArray).value;
    const newQuestionTempId = this.question?.id ?? generateId(4);

    const questionChoices: QuestionChoice[] = answersArray.map(
      (answer: any) => ({
        id: generateId(4),
        questionId: newQuestionTempId,
        text: answer.text,
        gradePercent: answer.gradePercent,
        feedback: answer.feedback || '',
      })
    );

    const newQuestion: Question = {
      id: newQuestionTempId,
      type: QuestionType.SHORT_ANSWER,
      questionName: this.form.get('questionName')?.value ?? '',
      questionText: this.form.get('questionText')?.value ?? '',
      status: this.form.get('status')?.value ?? QuestionStatus.READY,
      defaultMark: this.form.get('defaultMark')?.value ?? 0,
      data: {
        choices: questionChoices,
      },
      createdBy: null,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      modifiedBy: null,
      usage: 0,
    };
    console.log('submit attempt with:', this.form.value);
    console.log('new question:', newQuestion);

    this.loading = true;
    await CreateQuestion(newQuestion, this.courseId)
      .then((question) => {
        console.log('Question created successfully:', question);
        this.toastrService.success('Question created successfully!');
        this.location.back();
      })
      .catch((error) => {
        console.error('Error creating question:', error);
        this.toastrService.error(error.message);
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
