import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthModule } from './modules/auth/auth.module';
import { AppRoutingModule } from './routes/app-route.module';
import { SharedModule } from './shared/shared.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { CalendarModule } from '@modules/calendar/calendar.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { AssignmentModule } from '@modules/assignment/assignment.module';
import { LinkModule } from '@modules/link/link.module';
import { PageModule } from '@modules/page/page.module';
import { SettingsModule } from '@modules/settings/settings.module';
import { ToReviewModule } from '@modules/to-review/to-review.module';
import { FileModule } from '@modules/file/file.module';
import { MeetingModule } from '@modules/meeting/meeting.module';

@NgModule({
  imports: [
    BrowserModule,
    SharedModule,
    RouterOutlet,
    AppRoutingModule,
    AuthModule,
    CoursesModule,
    QuizModule,
    AssignmentModule,
    CalendarModule,
    LinkModule,
    FileModule,
    PageModule,
    SettingsModule,
    ToReviewModule,
    ToastrModule.forRoot(),
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    provideToastr({
      timeOut: 10000,
      positionClass: 'toast-bottom-left',
      preventDuplicates: true,
      toastClass: 'custom-toast ngx-toastr',
      closeButton: true,
    }),
    provideAnimations(),
  ],
})
export class AppModule {}