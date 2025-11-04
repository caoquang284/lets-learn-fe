import { FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {
  FormControlField,
  UnpackedFormGroup,
} from '@shared/helper/form.helper';

export interface INewCourseFormSchema {
  courseId: FormControl<string>;
  title: FormControl<string>;
  category: FormControl<string>;
  level: FormControl<string>;
  visibility: FormControl<'0' | '1' | null>;
}

export type INewCourseFormData = UnpackedFormGroup<INewCourseFormSchema>;

export const newCourseFormSchema: INewCourseFormSchema = {
  courseId: new FormControl('', {
    validators: [Validators.required, Validators.minLength(2)],
    nonNullable: true,
  }),
  title: new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  }),
  category: new FormControl('Academic', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  }),
  level: new FormControl('Beginner', {
    validators: [Validators.required],
    nonNullable: true,
  }),
  visibility: new FormControl(null, {
    validators: [Validators.required],
    nonNullable: true,
  }),
};

export const newCourseFormControls: FormControlField[] = [
  {
    id: 'courseId',
    label: 'Course ID',
    type: 'text',
    componentType: 'input',
    placeholder: 'E.g. CS101',
    description: 'Enter the unique Course ID/code',
    validationMessages: {
      required: 'Course ID is required',
      minlength: 'Course ID must be at least 2 characters',
    },
  },
  {
    id: 'title',
    label: 'Name',
    type: 'text',
    componentType: 'input',
    placeholder: 'E.g. Introduction to Astronomy',
    description: 'What will you teach in this course?',
    validationMessages: {
      required: 'Course name is required',
      minlength: 'Course name must be at least 3 characters',
    },
  },
  {
    id: 'category',
    label: 'Category',
    type: 'text',
    componentType: 'input',
    placeholder: 'E.g. Academic',
    description: 'What subject area best describes your course?',
    validationMessages: {
      required: 'Course category is required',
      minlength: 'Course category must be at least 3 characters',
    },
  },
  {
    id: 'level',
    label: 'Level',
    type: 'text',
    componentType: 'input',
    placeholder: 'E.g. Beginner',
    description: 'What level is your course?',
    validationMessages: {
      required: 'Course level is required',
    },
  },
  {
    id: 'visibility',
    label: 'Visibility',
    type: 'select',
    componentType: 'select',
    placeholder: 'Select visibility',
    options: [
      { value: '1', label: 'Public' },
      { value: '0', label: 'Private' },
    ],
    descriptionOnOption: {
      default: 'Choose who can access your course',
      '1': 'Anyone can access the course',
      '0': 'Only participants can access the course',
    },
    validationMessages: {
      required: 'Course visibility is required',
    },
  },
];
