import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateChoiceQuestionComponent } from '@modules/quiz/components/quiz-page/create-question/create-choice-question/create-choice-question.component';
import { CreateShortAnswerQuestionComponent } from '@modules/quiz/components/quiz-page/create-question/create-short-answer-question/create-short-answer-question.component';
import { CreateTrueFalseQuestionComponent } from '@modules/quiz/components/quiz-page/create-question/create-true-false-question/create-true-false-question.component';

const routes: Routes = [
  {
    path: 'true-false/create',
    component: CreateTrueFalseQuestionComponent,
  },
  {
    path: 'true-false/:questionId/edit',
    component: CreateTrueFalseQuestionComponent,
  },
  {
    path: 'choice/create',
    component: CreateChoiceQuestionComponent,
  },
  {
    path: 'choice/:questionId/edit',
    component: CreateChoiceQuestionComponent,
  },
  {
    path: 'short-answer/create',
    component: CreateShortAnswerQuestionComponent,
  },
  {
    path: 'short-answer/:questionId/edit',
    component: CreateShortAnswerQuestionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateQuestionRoutingModule {}
