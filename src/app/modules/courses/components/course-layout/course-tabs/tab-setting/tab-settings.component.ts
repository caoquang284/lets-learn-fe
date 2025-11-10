import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { openAlertDialog } from '@shared/helper/alert.helper';
import { FormControlField } from '@shared/helper/form.helper';
import { Course } from '@shared/models/course';
import { ToastrService } from 'ngx-toastr';
import {
  courseGeneralSettingFormControls,
  courseSettingFormSchema,
} from './course-setting-form.config';

// Mock function for updating course - replace with actual API call
async function UpdateCourse(course: Course): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
}

@Component({
  selector: 'tab-settings',
  standalone: false,
  templateUrl: './tab-settings.component.html',
  styleUrl: './tab-settings.component.scss',
  providers: [CollapsibleListService],
})
export class TabSettingComponent implements OnInit {
  @Input({ required: true }) course!: Course;
  sectionIds: string[] = ['general', 'danger-zone'];
  showPassword = false;
  form!: FormGroup;
  generalFormControls = courseGeneralSettingFormControls;
  dangerZoneFormControls: FormControlField[] = [];

  constructor(
    private fb: FormBuilder,
    private collapsibleListService: CollapsibleListService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(courseSettingFormSchema, { updateOn: 'submit' });
    this.collapsibleListService.setSectionIds(this.sectionIds);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.expandAll();
    if (this.course) {
      this.form.patchValue(this.getFormValuesFromCourse(this.course));
      this.dangerZoneFormControls = [
        {
          id: 'change-to-public',
          label: 'Change course visibility',
          type: 'button',
          componentType: 'button',
          placeholder: '',
          note: this.course.isPublished ? 'This course is currently public.' : 'This course is currently private.',
          buttonColor: '#B91C1C',
          buttonText: this.course.isPublished ? 'Change to private' : 'Change to public',
          onClick: async () => {
            const confirmed = await openAlertDialog(
              this.dialog,
              'Change Course Visibility',
              this.course.isPublished
                ? 'Are you sure you want to make this course private?'
                : 'Are you sure you want to make this course public?',
              'Yes',
              'Cancel',
              true
            );
            if (confirmed) {
              const updatedCourse = { ...this.course, isPublished: !this.course.isPublished };
              try {
                await UpdateCourse(updatedCourse);
                this.course.isPublished = updatedCourse.isPublished;
                this.dangerZoneFormControls[0].note = this.course.isPublished ? 'This course is currently public.' : 'This course is currently private.';
                this.dangerZoneFormControls[0].buttonText = this.course.isPublished ? 'Change to private' : 'Change to public';
                this.toastr.success('Course visibility updated', 'Success');
              } catch (error) {
                this.toastr.error('Failed to update course visibility', 'Error');
              }
            }
          },
          validationMessages: {},
        },
      ];
    }
  }

  private getFormValuesFromCourse(course: Course) {
    return {
      courseId: course.id,
      name: course.title || '',
      category: course.category || '',
      level: (course.level || 'beginner').toLowerCase(),
    };
  }

  getDisabled(controlName: string): boolean {
    const control = this.form.get(controlName);
    console.log(controlName, control);
    return control ? control.disabled : false;
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const updatedCourse = {
      ...this.course,
      ...this.form.value,
      title: this.form.value.name,
    };
    delete updatedCourse.name;
    try {
      await UpdateCourse(updatedCourse);
      this.toastr.success('Course updated successfully', 'Success');
    } catch (error) {
      this.toastr.error('Failed to update course', 'Error');
    }
  }
}
