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
import { GetQuestion, UpdateQuestion } from '@modules/quiz/api/question.api';
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
} from '../../create-question/create-choice-question/create-choice-question-form.config';

@Component({
  selector: 'update-choice-question',
  standalone: false,
  templateUrl: './update-choice-question.component.html',
  styleUrl: './update-choice-question.component.scss',
  providers: [CollapsibleListService],
})
export class UpdateChoiceQuestionComponent {
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

  initForm(question: Question): void {
    const questionData = question.data as ChoiceQuestion;
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
      multiple: new FormControl<boolean>(questionData?.multiple ?? false),
      answers: this.fb.array(
        questionData.choices.map((choice) => this.getAnswerFormGroup(choice)),
        Validators.required
      ),
    });
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

    if (!this.checkValidGradePercents()) return;

    const answersArray = (this.form.get('answers') as FormArray).value;
    const existingChoices = (this.question!.data as ChoiceQuestion).choices;
    const questionChoices: QuestionChoice[] = answersArray.map(
      (answer: any, index: number) => ({
        id: existingChoices[index]?.id ?? generateId(4),
        questionId: this.question!.id,
        text: answer.text,
        gradePercent: answer.gradePercent,
        feedback: answer.feedback || '',
      })
    );

    const updatedQuestion: Question = {
      ...this.question!,
      type: QuestionType.CHOICE,
      questionName: this.form.get('questionName')?.value ?? '',
      questionText: this.form.get('questionText')?.value ?? '',
      status: this.form.get('status')?.value ?? QuestionStatus.READY,
      defaultMark: this.form.get('defaultMark')?.value ?? 0,
      data: {
        multiple: this.form.get('multiple')?.value ?? false,
        choices: questionChoices,
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
