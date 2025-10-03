import { FormControl, Validators } from '@angular/forms';
import { FormControlField } from '@shared/helper/form.helper';

export const profileFormSchema = {
  username: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.pattern(/^[a-zA-Z0-9_ ]+$/),
  ]),
  email: new FormControl('', [
    Validators.required,
    Validators.email,
  ]),
};

export const passwordFormSchema = {
  currentPassword: new FormControl('', [
    Validators.required,
    Validators.minLength(8),
  ]),
  newPassword: new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  ]),
  confirmPassword: new FormControl('', [
    Validators.required,
  ]),
};

export const profileFormControls: FormControlField[] = [
  {
    id: 'username',
    label: 'Username',
    type: 'text',
    componentType: 'input',
    placeholder: 'Enter username',
    validationMessages: {
      required: 'Username is required',
      minlength: 'Username must be at least 3 characters',
      pattern: 'Username can only contain letters, numbers and underscores',
    },
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    componentType: 'input',
    placeholder: 'Enter email',
    validationMessages: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
    },  },
];

export const passwordFormControls: FormControlField[] = [
  {
    id: 'currentPassword',
    label: 'Current Password',
    type: 'password',
    componentType: 'input',
    placeholder: 'Enter current password',
    validationMessages: {
      required: 'Current password is required',
      minlength: 'Password must be at least 8 characters',
    },
  },
  {
    id: 'newPassword',
    label: 'New Password',
    type: 'password',
    componentType: 'input',
    placeholder: 'Enter new password',
    validationMessages: {
      required: 'New password is required',
      minlength: 'Password must be at least 8 characters',
      pattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  },
  {
    id: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    componentType: 'input',
    placeholder: 'Confirm new password',
    validationMessages: {
      required: 'Confirm password is required',
      confirmPasswordMismatch: 'Confirm password does not match',
    },
  },
];

export const passwordFormConfig = {
  schema: passwordFormSchema,
  validationMessages: {
    currentPassword: {
      required: 'Current password is required',
      minlength: 'Password must be at least 8 characters',
    },
    newPassword: {
      required: 'New password is required',
      minlength: 'Password must be at least 8 characters',
      pattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
    confirmPassword: {
      required: 'Confirm password is required',
      confirmPasswordMismatch: 'Confirm password does not match',
    },
  },
};
export const profileFormConfig = {
  schema: profileFormSchema,
  validationMessages: {
    username: {
      required: 'Username is required',
      minlength: 'Username must be at least 3 characters',
      pattern: 'Username can only contain letters, numbers and underscores',
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
    },
  },
};
