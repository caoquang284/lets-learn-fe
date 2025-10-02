import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedModule } from '@shared/shared.module';
import { QuizAttemptingComponent } from './components/quiz-page/quiz-attempting/quiz-attempting.component';
import { QuizChoiceAnswerComponent } from './components/quiz-page/quiz-attempting/quiz-choice-answer/quiz-choice-answer.component';
import { QuizDescriptionComponent } from './components/quiz-page/quiz-attempting/quiz-description/quiz-description.component';
import { QuizNavigationComponent } from './components/quiz-page/quiz-attempting/quiz-navigation/quiz-navigation.component';
import { QuizResultComponent } from './components/quiz-page/quiz-attempting/quiz-result/quiz-result.component';
import { QuizShortAnswerComponent } from './components/quiz-page/quiz-attempting/quiz-short-answer/quiz-short-answer.component';
import { QuizTrueFalseAnswerComponent } from './components/quiz-page/quiz-attempting/quiz-true-false-answer/quiz-true-false-answer.component';
import { QuizPageComponent } from './components/quiz-page/quiz-page.component';
import { TabQuestionBankComponent } from './components/quiz-page/quiz-tabs/tab-question-bank/tab-question-bank.component';
import { QuestionItemComponent } from './components/quiz-page/quiz-tabs/tab-question/question-list/question-item/question-item.component';
import { QuestionListComponent } from './components/quiz-page/quiz-tabs/tab-question/question-list/question-list.component';
import { QuizStatusBannerComponent } from './components/quiz-page/quiz-tabs/tab-question/quiz-status-banner/quiz-status-banner.component';
import { TabQuestionComponent } from './components/quiz-page/quiz-tabs/tab-question/tab-question.component';
import { TabQuizStudentComponent } from './components/quiz-page/quiz-tabs/tab-quiz-student/tab-quiz-student.component';
import { TabQuizComponent } from './components/quiz-page/quiz-tabs/tab-quiz/tab-quiz.component';
import { ResultTableComponent } from './components/quiz-page/quiz-tabs/tab-result/result-table/result-table.component';
import { TabResultComponent } from './components/quiz-page/quiz-tabs/tab-result/tab-result.component';
import { TabSettingComponent } from './components/quiz-page/quiz-tabs/tab-setting/tab-setting.component';
import { TabDashboardComponent } from './components/quiz-page/quiz-tabs/tab-dashboard/tab-dashboard.component';
import { DashboardComponent } from './components/quiz-page/quiz-tabs/tab-dashboard/dashboard/dashboard.component';
import { QuizResultTableComponent } from './components/quiz-result-table/quiz-result-table.component';
import { ImageColumnComponent } from './components/quiz-page/quiz-tabs/tab-result/result-table/table-columns/image-column/image-column.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { QuestionBankTableComponent } from './components/quiz-page/quiz-tabs/tab-question-bank/question-bank-table/question-bank-table.component';
import { StatusColumnComponent } from './components/quiz-page/quiz-tabs/tab-question-bank/question-bank-table/table-columns/status-column/status-column.component';
import { ActionColumnComponent } from './components/quiz-page/quiz-tabs/tab-question-bank/question-bank-table/table-columns/action-column/action-column.component';
@NgModule({
  declarations: [
    QuizResultTableComponent,
    QuizPageComponent,
    TabQuizComponent,
    TabQuizStudentComponent,
    QuizAttemptingComponent,
    QuizDescriptionComponent,
    QuizNavigationComponent,
    QuizChoiceAnswerComponent,
    QuizTrueFalseAnswerComponent,
    QuizShortAnswerComponent,
    QuizResultComponent,
    TabSettingComponent,
    TabQuestionBankComponent,
    TabQuestionComponent,
    TabResultComponent,
    QuizStatusBannerComponent,
    QuestionItemComponent,
    QuestionListComponent,
    ResultTableComponent,
    ImageColumnComponent,
    QuestionBankTableComponent,
    StatusColumnComponent,
    ActionColumnComponent,
    TabDashboardComponent,
    DashboardComponent,
  ],
  imports: [
    SharedModule,
    RouterOutlet,
    FormsModule,
    SharedComponentsModule,
    CdkDropList,
    CdkDrag,
    MatTableModule,
    MatPaginatorModule,
  ],
  exports: [QuizAttemptingComponent],
})
export class QuizModule {}