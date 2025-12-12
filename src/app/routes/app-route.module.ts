import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from '../modules/auth/components/login-page/login-page.component';
import { RegisterPageComponent } from '../modules/auth/components/register-page/register-page.component';
import { CalendarPageComponent } from '@modules/calendar/components/calendar-page/calendar-page.component';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { SettingsPageComponent } from '@modules/settings/components/settings-page/settings-page.component';
import { LandingPageComponent } from '@modules/page/components/landing-page/landing-page.component';

const routes: Routes = [
  // Landing page - trang chủ cho người dùng chưa đăng nhập
  { path: '', component: LandingPageComponent },
  
  // Auth routes - đăng nhập và đăng ký
  { path: 'auth/login', component: LoginPageComponent },
  { path: 'auth/signup', component: RegisterPageComponent },
  
  // App routes với Layout - chỉ dành cho người dùng đã đăng nhập
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'courses', pathMatch: 'full' },
      { path: 'calendar', component: CalendarPageComponent },
      { path: 'settings', component: SettingsPageComponent },
      {
        path: 'to-do',
        loadChildren: () =>
          import('@modules/to-do/to-do.module').then((m) => m.ToDoModule),
      },
      {
        path: 'courses',
        loadChildren: () =>
          import('@routes/course-route.module').then(
            (m) => m.CourseRoutingModule
          ),
      },
      {
        path: 'to-review',
        loadChildren: () =>
          import('@modules/to-review/to-review.module').then(
            (m) => m.ToReviewModule
          ),
      },
    ],
  },
  
  // Legacy routes - redirect to new structure
  { path: 'home', redirectTo: 'app/courses', pathMatch: 'full' },
  { path: 'courses', redirectTo: 'app/courses', pathMatch: 'full' },
  { path: 'calendar', redirectTo: 'app/calendar', pathMatch: 'full' },
  { path: 'settings', redirectTo: 'app/settings', pathMatch: 'full' },
  { path: 'to-do', redirectTo: 'app/to-do', pathMatch: 'full' },
  { path: 'to-review', redirectTo: 'app/to-review', pathMatch: 'full' },
  
  // Quiz attempting routes - không có layout
  {
    path: 'quiz',
    loadChildren: () =>
      import('@routes/quiz-attempting-route.module').then(
        (m) => m.QuizAttemptingRoutingModule
      ),
  },
  {
    path: 'app/courses/:courseId/quiz',
    loadChildren: () =>
      import('@routes/quiz-attempting-route.module').then(
        (m) => m.QuizAttemptingRoutingModule
      ),
  },
  
  // Meeting room routes - không có layout
  {
    path: 'meeting',
    loadChildren: () =>
      import('@routes/meeting-room-route.module').then(
        (m) => m.MeetingRoomRoutingModule
      ),
  },
  
  // Wildcard redirect về landing page
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
})
export class AppRoutingModule {}