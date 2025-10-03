import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { passwordFormConfig, passwordFormControls } from '../settings-form.config';
import { scrollToFirstInvalidField } from '@shared/helper/common.helper';
import { confirmPasswordMatchValidator } from '@shared/validation/confirm-password-match.validator';
import { FormControlField } from '@shared/helper/form.helper';
import { SettingsService } from '@shared/services/settings.service';

@Component({
  selector: 'tab-password',
  standalone: false,
  templateUrl: './tab-password.component.html',
  styleUrl: './tab-password.component.scss',
})
export class TabPasswordComponent {
  passwordForm!: FormGroup;
  formConfig = passwordFormConfig;
  loading = false;

  currentPasswordControl: FormControlField;
  newPasswordControl: FormControlField;
  confirmPasswordControl: FormControlField;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.passwordForm = this.fb.group(this.formConfig.schema, {
      validators: confirmPasswordMatchValidator,
    });
    
    this.currentPasswordControl = passwordFormControls.find(control => control.id === 'currentPassword')!;
    this.newPasswordControl = passwordFormControls.find(control => control.id === 'newPassword')!;
    this.confirmPasswordControl = passwordFormControls.find(control => control.id === 'confirmPassword')!;
  }
  changePassword(e: Event): void {
    e.preventDefault();
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      scrollToFirstInvalidField();
      return;
    }
    
    this.loading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    
    this.settingsService.updatePassword(currentPassword, newPassword)
      .then(() => {
        this.passwordForm.reset();
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
