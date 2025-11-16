import { Component, Input } from '@angular/core';
import { QuizTopic } from '@shared/models/topic';
import { QuizService } from '@shared/services/quiz.service';

@Component({
  selector: 'tab-question',
  standalone: false,
  templateUrl: './tab-question.component.html',
  styleUrl: './tab-question.component.scss',
})
export class TabQuestionComponent {
  @Input({ required: true }) topic!: QuizTopic;

  constructor(private quizService: QuizService) {}

  getQuestions() {
    return this.topic.data.questions;
  }

  getTotalMarks() {
    return this.quizService.getFullMarkOfQuiz(this.topic);
  }
}
