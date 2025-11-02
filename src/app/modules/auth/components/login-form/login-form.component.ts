import { Component, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';
import { loginFormConfig } from './login-form.config';

@Component({
  selector: 'login-form',
  standalone: false,
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent implements OnInit {
  showPassword = false;
  form!: FormGroup;
  formConfig = loginFormConfig;
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.form = this.fb.group(this.formConfig.schema);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(e: Event): Promise<void> {
    e.preventDefault(); // Prevent default form submission
    // Stop here if form is invalid
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Mark all controls as touched to show validation errors
      return;
    }
    this.loading = true; // Set loading state to true
    const { email, password } = this.form.value;

    this.authService.login(email, password).finally(() => {
      this.loading = false;
    });

    console.log('Login attempt with:', this.form.value);
  }
}
