import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '@shared/models/user';
import {
  profileFormConfig,
  profileFormControls,
} from '../settings-form.config';
import { scrollToFirstInvalidField } from '@shared/helper/common.helper';
import { FormControlField } from '@shared/helper/form.helper';
import { SettingsService } from '@shared/services/settings.service';
import { ToastrService } from 'ngx-toastr';
import { UploadCloudinaryFile } from '@shared/api/cloudinary.api';

@Component({
  selector: 'tab-profile',
  standalone: false,
  templateUrl: './tab-profile.component.html',
  styleUrl: './tab-profile.component.scss',
})
export class TabProfileComponent implements OnChanges {
  @Input() user: User | null = null;
  profileForm: FormGroup;
  formConfig = profileFormConfig;
  loading = false;
  uploadingImage = false;
  uploadedImageUrl: string | null = null;

  usernameControl: FormControlField;
  emailControl: FormControlField;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastrService
  ) {
    this.profileForm = this.fb.group(this.formConfig.schema);
    this.usernameControl = profileFormControls.find(
      (control) => control.id === 'username'
    )!;
    this.emailControl = profileFormControls.find(
      (control) => control.id === 'email'
    )!;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.profileForm.patchValue({
        username: this.user.username || '',
        email: this.user.email || '',
      });
      this.profileForm.get('email')?.disable();
    }
  }
  saveProfile(e: Event): void {
    e.preventDefault();
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      scrollToFirstInvalidField();
      return;
    }
    this.loading = true;
    const { username } = this.profileForm.value;

    const avatarUrl = this.uploadedImageUrl || this.user!.avatar;

    this.settingsService
      .updateProfile(username, avatarUrl)
      .then(() => {
        this.uploadedImageUrl = null;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onImageClick(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    fileInput.onchange = (event: any) => {
      this.onFileSelected(event);
    };
    fileInput.click();
  }

  private onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.toastService.error(
          'Only .jpg, .jpeg, .png or .webp files are allowed'
        );
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.toastService.error('File size must be less than 2MB');
        return;
      }
      this.uploadImage(file);
    }
  }
  async uploadImage(file: File) {
    this.uploadingImage = true;
    await UploadCloudinaryFile(file)
      .then((res) => {
        this.uploadedImageUrl = res.secure_url;
        this.toastService.success('Profile image uploaded successfully');
      })
      .catch((error) => {
        this.toastService.error('Failed to upload image. Please try again.');
      })
      .finally(() => {
        this.uploadingImage = false;
      });
  }

  get currentImageUrl(): string {
    return (
      this.uploadedImageUrl ||
      this.user?.avatar ||
      '/images/mock-user-image.jpg'
    );
  }
}
