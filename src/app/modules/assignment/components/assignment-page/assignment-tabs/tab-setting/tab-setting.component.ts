import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { formatDateString } from '@shared/helper/date.helper';
import { AssignmentTopic } from '@shared/models/topic';
import {
  assignmentAvailabilitySettingFormControls,
  assignmentGeneralSettingFormControls,
  assignmentSettingFormSchema,
  assignmentSubmissionSettingFormControls,
} from './assignment-setting-form.config';
import { UpdateTopic } from '@modules/courses/api/topic.api';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'tab-setting',
  standalone: false,
  templateUrl: './tab-setting.component.html',
  styleUrl: './tab-setting.component.scss',
  providers: [CollapsibleListService],
})
export class TabSettingComponent implements OnInit {
  @Input({ required: true }) topic!: AssignmentTopic;
  @Output() topicChange = new EventEmitter<AssignmentTopic>();
  form!: FormGroup;
  sectionIds: string[] = ['general', 'availability', 'submission'];
  showPassword = false;
  generalFormControls = assignmentGeneralSettingFormControls;
  availabilityFormControls = assignmentAvailabilitySettingFormControls;
  submissionFormControls = assignmentSubmissionSettingFormControls;

  constructor(
    private fb: FormBuilder,
    private collapsibleListService: CollapsibleListService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(assignmentSettingFormSchema, {
      updateOn: 'submit',
    });
    this.collapsibleListService.setSectionIds(this.sectionIds);
    this.collapsibleListService.setCanEdit(false); // disable edit UI in collapsible list
    this.collapsibleListService.expandAll();
    if (this.topic) {
      // Check if open/close times exist to set checkbox states
      const hasOpenTime = !!this.topic.data?.open;
      const hasCloseTime = !!this.topic.data?.close;
      const hasMaximumFileUpload =
        !!this.topic.data?.maximumFile && this.topic.data.maximumFile > 1;
      const hasMaximumFileSize = !!this.topic.data?.maximumFileSize;

      this.form.patchValue({
        name: this.topic.title || '',
        description: this.topic.data?.description || '',
        hasOpenTime: hasOpenTime,
        hasCloseTime: hasCloseTime,
        hasMaximumFileUpload: hasMaximumFileUpload,
        hasMaximumFileSize: hasMaximumFileSize,
        open: this.topic.data?.open
          ? new Date(this.topic.data.open)
          : new Date(),
        close: this.topic.data?.close
          ? new Date(this.topic.data.close)
          : new Date(),
        maximumFile: this.topic.data?.maximumFile || 1,
        maximumFileSize: this.topic.data?.maximumFileSize || '',
        additionalFile: this.topic.data?.cloudinaryFiles || [],
        remindToGrade: this.topic.data?.remindToGrade || null,
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

      if (hasMaximumFileUpload) {
        this.form.get('maximumFile')?.enable();
      } else {
        this.form.get('maximumFile')?.disable();
      }

      if (hasMaximumFileSize) {
        this.form.get('maximumFileSize')?.enable();
      } else {
        this.form.get('maximumFileSize')?.disable();
      }
    }
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
    } else if (controlName === 'hasMaximumFileUpload') {
      if (isChecked) this.form.get('maximumFile')?.enable();
      else this.form.get('maximumFile')?.disable();
    } else if (controlName === 'hasMaximumFileSize') {
      if (isChecked) this.form.get('maximumFileSize')?.enable();
      else this.form.get('maximumFileSize')?.disable();
    }
  }

  getDisabled(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.disabled : false;
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
    if (!this.topic) return;

    const formValues = this.form.getRawValue();
    this.topic.title = formValues.name;

    this.topic.data = this.topic.data || {};
    this.topic.data.description = formValues.description;

    if (formValues.hasOpenTime && this.form.get('open')?.enabled) {
      this.topic.data.open = formValues.open
        ? new Date(formValues.open).toISOString()
        : null;
    } else {
      this.topic.data.open = null;
    }

    if (formValues.hasCloseTime && this.form.get('close')?.enabled) {
      this.topic.data.close = formValues.close
        ? new Date(formValues.close).toISOString()
        : null;
    } else {
      this.topic.data.close = null;
    }

    if (
      formValues.hasMaximumFileUpload &&
      this.form.get('maximumFile')?.enabled
    ) {
      this.topic.data.maximumFile = formValues.maximumFile;
    } else {
      this.topic.data.maximumFile = 1;
    }

    if (
      formValues.hasMaximumFileSize &&
      this.form.get('maximumFileSize')?.enabled
    ) {
      this.topic.data.maximumFileSize = formValues.maximumFileSize;
    } else {
      this.topic.data.maximumFileSize = null;
    }

    if (formValues.additionalFile && formValues.additionalFile.length > 0) {
      const uploadedFile = formValues.additionalFile[0];
      this.topic.data.cloudinaryFiles = [uploadedFile];
    }
    this.topic.data.remindToGrade = formValues.remindToGrade;
    (this.topic.data as any).topicId = this.topic.id;

    const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
    if (courseId) {
      await UpdateTopic(this.topic, courseId)
        .then((updatedTopic) => {
          this.topic = updatedTopic as AssignmentTopic;
          this.toastr.success(
            'Assignment settings saved successfully!',
            'Success'
          );
          this.topicChange.emit(this.topic);
        })
        .catch((error) => {
          console.error('Error updating assignment:', this.topic.data);
          this.toastr.error(
            'Failed to save assignment settings. Please try again.',
            'Error'
          );
          throw error;
        });
    } else {
      this.toastr.error('Course ID not found in route parameters', 'Error');
    }
  }
}
