import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES } from '@shared/constants/routes';
import { GOOGLE_ICON_LINK } from '@shared/helper/google-icon.helper';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'ng-lets-learn-fe';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    // Config for Google Material Icons
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = GOOGLE_ICON_LINK;
    document.head.appendChild(link);

    // Subscribe to user changes
    this.userService.user$.subscribe((user) => {
      // Use set timeout to ensure the router navigation happens after the current change detection cycle
      // This ensures that we can get correct current URL
      setTimeout(() => {
        const currentUrl = this.router.url;
        const publicRoutes = ['/', '/auth/login', '/auth/signup'];
        const isPublicRoute = publicRoutes.includes(currentUrl) || currentUrl.startsWith('/auth/');
        
        // If user is not logged in
        if (!user) {
          // If not on public route, redirect to landing page
          if (!isPublicRoute) {
            const tree = this.router.createUrlTree(['/']);
            this.router.navigateByUrl(tree, { replaceUrl: true });
          }
        }
        // If user is logged in
        else {
          // If on landing page or auth pages, redirect to app
          if (isPublicRoute) {
            const tree = this.router.createUrlTree(['/app/courses']);
            this.router.navigateByUrl(tree, { replaceUrl: true });
          }
        }
      });
    });
  }
}
