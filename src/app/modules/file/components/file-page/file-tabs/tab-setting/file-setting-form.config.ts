import { FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormControlField } from '@shared/helper/form.helper';
import { CloudinaryFile } from '@shared/models/cloudinary-file';

// Custom validator to ensure only 1 file is uploaded
function maxFilesValidator(maxFiles: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !Array.isArray(control.value)) {
      return null;
    }
    
    if (control.value.length > maxFiles) {
      return { maxFiles: { maxFiles, actual: control.value.length } };
    }
    
    return null;
  };
}

export const fileSettingFormSchema = {
  name: new FormControl('', [Validators.required, Validators.minLength(2)]),
  description: new FormControl(''),
  additionalFile: new FormControl([] as CloudinaryFile[], [maxFilesValidator(1)]),
};

export const fileGeneralSettingFormControls: FormControlField[] = [
  {
    id: 'name',
    label: 'File name',
    type: 'text',
    componentType: 'input',
    placeholder: 'Enter file name',
    validationMessages: {
      required: 'File name is required',
      minlength: 'File name must be at least 2 characters',
    },
  },
  {
    id: 'description',
    label: 'Description',
    type: 'text',
    componentType: 'input',
    placeholder: 'Description for file here',
    validationMessages: {},
  },
  {
    id: 'additionalFile',
    label: 'File upload (max 1 file)',
    type: '',
    componentType: 'file-upload',
    placeholder: '',
    validationMessages: {
      maxFiles: 'Only 1 file is allowed',
    },
  },
];

export const fileValidationMessages = {
  name: {
    required: 'File name is required',
    minlength: 'File name must be at least 2 characters',
  },
  description: {},
  additionalFile: {
    maxFiles: 'Only 1 file is allowed',
  },
};
