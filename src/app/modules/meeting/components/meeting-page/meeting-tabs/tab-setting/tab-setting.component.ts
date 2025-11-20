import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Editor, Toolbar } from 'ngx-editor';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { meetingGeneralSettingFormControls, meetingSettingFormSchema, meetingValidationMessages } from './meeting-setting-form.config';
import { MeetingTopic } from '@shared/models/topic';
import { MeetingData } from '@shared/models/meeting';
import { UpdateTopic } from '@modules/courses/api/topic.api';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'tab-setting',
  templateUrl: './tab-setting.component.html',
  styleUrls: ['./tab-setting.component.scss'],
  standalone: false,
  providers: [CollapsibleListService],
})
export class TabSettingComponent implements OnInit, OnDestroy {
  editor!: Editor;
  toolbar: Toolbar = [
    [
      'bold',
      'italic',
      'underline',
      'strike',
      'code',
    ],
    [
      'blockquote',
      'ordered_list',
      'bullet_list',
      'link',
      'image',
    ],
    [
      'text_color',
      'background_color',
      'align_left',
      'align_center',
      'align_right',
      'align_justify',
    ],
    [
      'undo',
      'redo',
    ],
  ];
  @Input({ required: true }) topic!: MeetingTopic;
  form!: FormGroup;
  sectionIds: string[] = ['general'];
  generalFormControls = meetingGeneralSettingFormControls;
  validationMessages = meetingValidationMessages;

  constructor(
    private fb: FormBuilder,
    private collapsibleListService: CollapsibleListService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.editor = new Editor();
    this.form = this.fb.group(meetingSettingFormSchema, { updateOn: 'submit' });
    this.collapsibleListService.setSectionIds(this.sectionIds);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.expandAll();
    // Initialize form with existing topic data
    if (this.topic) {
      const meetingData = this.topic.data as MeetingData;
      // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
      const meetingDateValue = meetingData?.open 
        ? new Date(meetingData.open).toISOString().slice(0, 16)
        : '';
      
      this.form.patchValue({
        name: this.topic.title || '',
        description: meetingData?.description || '',
        meetingDate: meetingDateValue
      });
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  getDisabled(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.disabled : false;
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    
    // Stop here if form is invalid
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
     
    if (!this.topic) {
      return;
    }
    
    const formValues = this.form.value;
    
    // Update topic title with name field
    this.topic.title = formValues.name;
    
    // Ensure topic.data exists
    this.topic.data = this.topic.data || { description: '', open: null, close: null };
    
    // Update topic data with form values
    const meetingData = this.topic.data as MeetingData;
    meetingData.description = formValues.description;
    // Convert datetime-local value to ISO string if present
    meetingData.open = formValues.meetingDate 
      ? new Date(formValues.meetingDate).toISOString() 
      : null;
    
    const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
    
    if (courseId) {
      await UpdateTopic(this.topic, courseId)
        .then((updatedTopic) => {
          this.topic = updatedTopic as MeetingTopic;
          this.toastrService.success('Meeting updated successfully!', 'Success');

          const topicId = this.activatedRoute.snapshot.paramMap.get('topicId');
          if (topicId) {
            this.router.navigate([`/courses/${courseId}/meeting/${topicId}`], {
              queryParams: { tab: 'meeting' }
            });
          }
        })
        .catch((error) => {
          console.error('Error updating topic:', error);
          this.toastrService.error('Failed to update meeting. Please try again.', 'Error');
        });
    } else {
      this.toastrService.error('Course ID not found in route parameters', 'Error');
    }
  }
}