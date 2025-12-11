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
  ChoiceQuestion,
  Question,
  QuestionChoice,
  QuestionStatus,
  QuestionType,
} from '@shared/models/question';
import { ToastrService } from 'ngx-toastr';
import {
  createChoiceQuestionGeneralFormControls,
  getChoiceQuestionAnswerFormControls,
  getChoiceQuestionAnswersFormControls,
} from './create-choice-question-form.config';

@Component({
  selector: 'create-choice-question',
  standalone: false,
  templateUrl: './create-choice-question.component.html',
  styleUrl: './create-choice-question.component.scss',
  providers: [CollapsibleListService],
})
export class CreateChoiceQuestionComponent {
  question: Question | null = null;
  courseId: string = '';
  sectionIds: string[] = ['general', 'answer'];
  showPassword = false;
  form!: FormGroup;
  generalFormControls = createChoiceQuestionGeneralFormControls;
  answerFormControls = getChoiceQuestionAnswersFormControls(3);
  loading = false;

  constructor(
    private fb: FormBuilder,
    private collapsibleListService: CollapsibleListService,
    private activedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private location: Location
  ) {}

  initForm(question: Question | null): void {
    const questionData = question ? (question.data as ChoiceQuestion) : null;
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
        multiple: new FormControl<boolean>(questionData?.multiple ?? false),
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
      text: new FormControl<string>(`Choice ${index + 1}`, [
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
        getChoiceQuestionAnswerFormControls(this.answerFormControls.length),
      ];
    }
  }

  removeQuestionChoice() {
    const answers = this.form.get('answers') as FormArray;
    if (answers && answers.length > 3) {
      answers.removeAt(answers.length - 1);
      this.answerFormControls.pop();
    } else {
      this.toastrService.error(
        'You must have at least 3 choices for a choice question. Please consider using True/False question type instead.'
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

    const isMultipleChoice = this.form.get('multiple')?.value ?? false;
    if (!isMultipleChoice) {
      const answerWithFullGradePercent = answers.controls.find(
        (control) => Number(control.get('gradePercent')?.value) === 100
      );
      if (!answerWithFullGradePercent) {
        this.toastrService.error(
          'At least one answer must have a grade percent of 100 for single choice questions.'
        );
        return false;
      }
    } else {
      // For multiple choice questions, the total grade percent must be equal to 100
      const totalGradePercent = answers.controls.reduce(
        (total, control) =>
          total + (Number(control.get('gradePercent')?.value) ?? 0),
        0
      );
      if (totalGradePercent !== 100) {
        this.toastrService.error(
          'The total grade percent of all answers must be equal to 100 for multiple choice questions.'
        );
        return false;
      }
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
      type: QuestionType.CHOICE,
      questionName: this.form.get('questionName')?.value ?? '',
      questionText: this.form.get('questionText')?.value ?? '',
      status: this.form.get('status')?.value ?? QuestionStatus.READY,
      defaultMark: this.form.get('defaultMark')?.value ?? 0,
      data: {
        multiple: this.form.get('multiple')?.value ?? false,
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

  onCancel() {
    this.location.back();
  }
}
