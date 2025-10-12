import { FormControl, Validators } from '@angular/forms';
import { FormControlField } from '@shared/helper/form.helper';

export const meetingSettingFormSchema = {
  name: new FormControl('', [Validators.required, Validators.minLength(2)]),
  description: new FormControl(''),
  meetingDate: new FormControl(''),
};

export const meetingGeneralSettingFormControls: FormControlField[] = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    componentType: 'input',
    placeholder: 'Meeting name',
    validationMessages: {
      required: 'Name is required',
      minlength: 'Name must be at least 2 characters',
    },
  },
  {
    id: 'meetingDate',
    label: 'Meeting Date & Time',
    type: 'datetime-local',
    componentType: 'input',
    placeholder: '',
    validationMessages: {},
  },
  {
    id: 'description',
    label: 'Description',
    type: 'text',
    componentType: 'input',
    placeholder: 'Meeting description',
    validationMessages: {},
  },
];

export const meetingValidationMessages = {
  name: {
    required: 'Name is required',
    minlength: 'Name must be at least 2 characters',
  },
  description: {},
  meetingDate: {},
};