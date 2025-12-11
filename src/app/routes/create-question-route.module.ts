import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateChoiceQuestionComponent } from '@modules/quiz/components/quiz-page/create-question/create-choice-question/create-choice-question.component';
import { CreateShortAnswerQuestionComponent } from '@modules/quiz/components/quiz-page/create-question/create-short-answer-question/create-short-answer-question.component';
import { CreateTrueFalseQuestionComponent } from '@modules/quiz/components/quiz-page/create-question/create-true-false-question/create-true-false-question.component';
import { UpdateChoiceQuestionComponent } from '@modules/quiz/components/quiz-page/update-question/update-choice-question/update-choice-question.component';
import { UpdateShortAnswerQuestionComponent } from '@modules/quiz/components/quiz-page/update-question/update-short-answer-question/update-short-answer-question.component';
import { UpdateTrueFalseQuestionComponent } from '@modules/quiz/components/quiz-page/update-question/update-true-false-question/update-true-false-question.component';

const routes: Routes = [
  {
    path: 'true-false/create',
    component: CreateTrueFalseQuestionComponent,
  },
  {
    path: 'true-false/:questionId/edit',
    component: UpdateTrueFalseQuestionComponent,
  },
  {
    path: 'choice/create',
    component: CreateChoiceQuestionComponent,
  },
  {
    path: 'choice/:questionId/edit',
    component: UpdateChoiceQuestionComponent,
  },
  {
    path: 'short-answer/create',
    component: CreateShortAnswerQuestionComponent,
  },
  {
    path: 'short-answer/:questionId/edit',
    component: UpdateShortAnswerQuestionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateQuestionRoutingModule {}
