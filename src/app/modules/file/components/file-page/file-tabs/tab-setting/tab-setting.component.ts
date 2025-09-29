import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { fileGeneralSettingFormControls, fileSettingFormSchema, fileValidationMessages } from './file-setting-form.config';
import { FileTopic } from '@shared/models/topic';
import { UpdateTopic } from '@modules/courses/api/topic.api';
import { ToastrService } from 'ngx-toastr';
import { scrollToFirstInvalidField } from '@shared/helper/common.helper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tab-setting',
  templateUrl: './tab-setting.component.html',
  styleUrls: ['./tab-setting.component.scss'],
  standalone: false,
  providers: [CollapsibleListService],
})
export class TabSettingComponent implements OnInit, OnDestroy {
  @Input({ required: true }) topic!: FileTopic;
  form!: FormGroup;
  sectionIds: string[] = ['general'];
  generalFormControls = fileGeneralSettingFormControls;
  validationMessages = fileValidationMessages;
  private fileControlSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private collapsibleListService: CollapsibleListService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.form = this.fb.group(fileSettingFormSchema, { updateOn: 'submit' });
    this.collapsibleListService.setSectionIds(this.sectionIds);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.expandAll();
    
    // Initialize form with existing topic data
    if (this.topic) {
      this.form.patchValue({
        name: this.topic.title || '',
        description: this.topic.data?.description || '',
        additionalFile: this.topic.data?.file ? [this.topic.data.file] : []
      });
    }

    this.fileControlSubscription = this.form.get('additionalFile')?.valueChanges.subscribe(files => {
      if (files && Array.isArray(files) && files.length > 1) {
        this.form.get('additionalFile')?.setValue([files[0]], { emitEvent: false });
        this.toastrService.warning('Only 1 file is allowed. The first file will be kept.', 'File Limit');
      }
    });
  }

  ngOnDestroy(): void {
    this.fileControlSubscription?.unsubscribe();
  }

  getDisabled(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.disabled : false;
  }

  async onSubmit(e: Event){
    e.preventDefault();
      // Stop here if form is invalid
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      scrollToFirstInvalidField();
      return;
    }

    if (!this.topic) {
      return;
    }
    
    const formValues = this.form.value;
    
    // Update topic title with name field
    this.topic.title = formValues.name;
    
    // Ensure topic data exists
    this.topic.data = this.topic.data || { file: null, description: '' };
    
    // Update topic data with form values
    this.topic.data.description = formValues.description;
    
    // Extract file from uploaded files and store in topic data
    if (formValues.additionalFile && formValues.additionalFile.length > 0) {
      const uploadedFile = formValues.additionalFile[0];
      this.topic.data.file = uploadedFile;
    }
    
    const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
    
    if (courseId) {
      // Call the API to update the topic
      await UpdateTopic(this.topic, courseId)
        .then((updatedTopic) => {
          this.topic = updatedTopic as FileTopic;
          
          // Show success message
          this.toastrService.success('File updated successfully!', 'Success');
          
          const topicId = this.activatedRoute.snapshot.paramMap.get('topicId');
          if (topicId) {
            this.router.navigate([`/courses/${courseId}/file/${topicId}`], {
              queryParams: { tab: 'file' }
            });
          }
        })
        .catch((error) => {
          console.error('Error updating topic:', error);
          this.toastrService.error('Failed to update file. Please try again.', 'Error');
        });
    } else {
      console.error('Course ID not found in route parameters');
    }
  }
}
