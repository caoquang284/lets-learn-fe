import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES } from '@shared/constants/routes';
import { User } from '@shared/models/user';
import { AuthService } from '@shared/services/auth.service';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'account-popover',
  standalone: false,
  templateUrl: './account-popover.component.html',
  styleUrl: './account-popover.component.scss',
})
export class AccountPopoverComponent {
  @Output() close = new EventEmitter<void>();
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.userService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  onProfileClick() {
    this.router.navigate([ROUTES.SETTINGS]);
    this.close.emit();
  }
  async onLogoutClick() {
    await this.authService.logout();
    this.close.emit();
  }
}
