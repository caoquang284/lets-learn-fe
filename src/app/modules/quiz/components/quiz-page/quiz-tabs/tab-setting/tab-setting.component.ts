import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { formatDateString } from '@shared/helper/date.helper';
import { StudentResponseService } from '@shared/services/student-response.service';
import {
  quizGeneralSettingFormControls,
  quizGradeSettingFormControls,
  quizSettingFormSchema,
  quizTimingSettingFormControls,
} from './quiz-setting-form.config';
import { TabQuizSettingService } from './tab-setting.service';
import { QuizTopic } from '@shared/models/topic';
import { UpdateTopic } from '@modules/courses/api/topic.api';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { TimeLimitType } from '@shared/models/quiz';

@Component({
  selector: 'tab-setting',
  standalone: false,
  templateUrl: './tab-setting.component.html',
  styleUrl: './tab-setting.component.scss',
  providers: [
    TabQuizSettingService,
    StudentResponseService,
    CollapsibleListService,
  ],
})
export class TabSettingComponent implements OnInit {
  @Input({ required: true }) topic!: QuizTopic;
  sectionIds: string[] = ['general', 'timing', 'grade'];
  showPassword = false;
  form!: FormGroup;
  generalFormControls = quizGeneralSettingFormControls;
  timingFormControls = quizTimingSettingFormControls;
  gradeFormControls = quizGradeSettingFormControls;

  constructor(
    private fb: FormBuilder,
    private collapsibleListService: CollapsibleListService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(quizSettingFormSchema, { updateOn: 'submit' });
    this.collapsibleListService.setSectionIds(this.sectionIds);
    this.collapsibleListService.setCanEdit(false); // disable edit UI in collapsible list
    this.collapsibleListService.expandAll();
    if (this.topic) {
      // Pre-fill and enable/disable timing fields like assignment tab
      const hasOpenTime = !!this.topic.data?.open;
      const hasCloseTime = !!this.topic.data?.close;
      const hasTimeLimit = !!this.topic.data?.timeLimit;
      this.form.patchValue({
        ...this.getFormValuesFromTopic(this.topic),
        hasOpenTime,
        hasCloseTime,
        hasTimeLimit,
      });
      if (hasOpenTime) {
        this.form.get('open')?.enable();
      } else {
        this.form.get('open')?.disable();
      }
      if (hasCloseTime) {
        this.form.get('close')?.enable();
      } else {
        this.form.get('close')?.disable();
      }
      if (hasTimeLimit) {
        this.form.get('timeLimit')?.enable();
        this.form.get('timeLimitUnit')?.enable();
      } else {
        this.form.get('timeLimit')?.disable();
        this.form.get('timeLimitUnit')?.disable();
      }
    }
  }

  private getFormValuesFromTopic(topic: QuizTopic) {
    return {
      name: topic.title || '',
      description: topic.data?.description || '',
      hasOpenTime: !!topic.data?.open,
      hasCloseTime: !!topic.data?.close,
      hasTimeLimit: !!topic.data?.timeLimit,
      open: topic.data?.open ? new Date(topic.data.open) : null,
      close: topic.data?.close ? new Date(topic.data.close) : null,
      timeLimit: topic.data?.timeLimit || 1,
      timeLimitUnit: topic.data?.timeLimitUnit || 'Hours',
      gradeToPass: topic.data?.gradeToPass || 5,
      attemptAllowed: topic.data?.attemptAllowed || 'Unlimited',
      gradingMethod: topic.data?.gradingMethod || 'Highest Grade',
    };
  }

  formatDate(date: string | null, pattern: string = 'MM/dd/yyyy HH:mm a') {
    return formatDateString(date, pattern);
  }

  onCheckboxChange(event: MatCheckboxChange) {
    const controlName = event.source.name;
    const isChecked = event.checked;
    if (controlName === 'hasOpenTime') {
      if (isChecked) this.form.get('open')?.enable();
      else this.form.get('open')?.disable();
    } else if (controlName === 'hasCloseTime') {
      if (isChecked) this.form.get('close')?.enable();
      else this.form.get('close')?.disable();
    } else if (controlName === 'hasTimeLimit') {
      if (isChecked) {
        this.form.get('timeLimit')?.enable();
        this.form.get('timeLimitUnit')?.enable();
      } else {
        this.form.get('timeLimit')?.disable();
        this.form.get('timeLimitUnit')?.disable();
      }
    }
  }

  getDisabled(controlName: string): boolean {
    const control = this.form.get(controlName);
    console.log(controlName, control);
    return control ? control.disabled : false;
  }

  async onSubmit(e: Event) {
    e.preventDefault();
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
    if (!this.topic) return;
    const formValues = this.form.getRawValue();
    this.topic.title = formValues.name;
    this.topic.data = this.topic.data || {};
    this.topic.data.description = formValues.description;
    if (formValues.hasOpenTime && this.form.get('open')?.enabled) {
      this.topic.data.open = formValues.open ? new Date(formValues.open).toISOString() : null;
    } else {
      this.topic.data.open = null;
    }
    if (formValues.hasCloseTime && this.form.get('close')?.enabled) {
      this.topic.data.close = formValues.close ? new Date(formValues.close).toISOString() : null;
    } else {
      this.topic.data.close = null;
    }
    if (formValues.hasTimeLimit && this.form.get('timeLimit')?.enabled) {
      this.topic.data.timeLimit = formValues.timeLimit;
      this.topic.data.timeLimitUnit = formValues.timeLimitUnit;
    } else {
      this.topic.data.timeLimit = null;
      this.topic.data.timeLimitUnit = TimeLimitType.HOURS;
    }
    this.topic.data.gradeToPass = formValues.gradeToPass;
    this.topic.data.attemptAllowed = formValues.attemptAllowed;
    this.topic.data.gradingMethod = formValues.gradingMethod;
    (this.topic.data as any).topicId = this.topic.id;
    const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
    if (courseId) {
      await UpdateTopic(this.topic, courseId)
        .then((result) => {
          this.topic = result as QuizTopic;
          this.toastr.success('Quiz settings updated successfully', 'Success');
        })
        .catch((error) => {
          console.error('Error updating quiz:', this.topic.data);
          this.toastr.error('Failed to update quiz settings. Please try again.', 'Error');
          throw error;
        });
    } else {
      this.toastr.error('Course ID not found in route parameters', 'Error');
    }
  }
}
