import { FormControl, Validators } from '@angular/forms';
import { FormControlField } from '@shared/helper/form.helper';

export const courseSettingFormSchema = {
  courseId: new FormControl({ value: '', disabled: true }),
  name: new FormControl('', [Validators.required, Validators.minLength(2)]),
  category: new FormControl('', [Validators.required, Validators.minLength(2)]),
  level: new FormControl('beginner', [Validators.required]),
};

export const courseGeneralSettingFormControls: FormControlField[] = [
  {
    id: 'courseId',
    label: 'Course ID',
    type: 'text',
    componentType: 'input',
    placeholder: 'Course ID',
    validationMessages: null,
  },
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    componentType: 'input',
    placeholder: 'E.g. Introduct To Astronomy',
    validationMessages: {
      required: 'Page name is required',
      minlength: 'Page name must be at least 2 characters',
    },
  },
  {
    id: 'category',
    label: 'Category',
    type: 'text',
    componentType: 'input',
    placeholder: 'Astronomy',
    validationMessages: {
      required: 'Category is required',
      minlength: 'Category must be at least 2 characters',
    },
  },
  {
    id: 'level',
    label: 'Level',
    type: 'text',
    componentType: 'select',
    placeholder: 'Astronomy',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
    validationMessages: {
      required: 'Level name is required',
    },
  },
];
export const courseDangerZoneSettingFormControls: FormControlField[] = [
  {
    id: 'change-to-public',
    label: 'Change course visibility',
    type: 'button',
    componentType: 'button',
    placeholder: '',
    note: 'This course is currently private.',
    buttonColor: '#B91C1C',
    buttonText: 'Change to public',
    onClick: () => {
      console.log('Change visibility action triggered');
    },
    validationMessages: {},
  },
];
