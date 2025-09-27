import { FormControl, Validators } from '@angular/forms';
import { FormControlField } from '@shared/helper/form.helper';

export const pageSettingFormSchema = {
  name: new FormControl('', [Validators.required, Validators.minLength(2)]),
  description: new FormControl(''),
  content: new FormControl(''),
};

export const pageGeneralSettingFormControls: FormControlField[] = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    componentType: 'input',
    placeholder: 'E.g. Astronomy Page',
    validationMessages: {
      required: 'Page name is required',
      minlength: 'Page name must be at least 2 characters',
    },
  },
  {
    id: 'description',
    label: 'Description',
    type: 'text',
    componentType: 'input',
    placeholder: 'E.g. This is a astronomy page',
    validationMessages: {},
  },
];
export const pageContentSettingFormControls: FormControlField[] = [
  {
    id: 'content',
    label: 'Page content',
    type: 'text',
    componentType: 'input',
    placeholder: 'Tiny Editor Content',
    validationMessages: {},
  },
];
