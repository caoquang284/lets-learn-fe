import { Component, inject, Input } from '@angular/core';
import { QuestionResult } from '@modules/quiz/constants/quiz.constant';
import { Question, TrueFalseQuestion } from '@shared/models/question';
import { QuizTrueFalseAnswerService } from './quiz-true-false-answer.service';

type Variant =
  | 'default'
  | 'selected'
  | 'correct'
  | 'incorrect'
  | 'missing'
  | 'not-selected';

@Component({
  selector: 'quiz-true-false-answer',
  standalone: false,
  templateUrl: './quiz-true-false-answer.component.html',
  styleUrl: './quiz-true-false-answer.component.scss',
  providers: [QuizTrueFalseAnswerService],
})
export class QuizTrueFalseAnswerComponent {
  @Input({ required: true }) question!: Question;
  @Input() value: boolean = false;
  showAnswer: boolean = false;
  selected: boolean = false;
  quizTrueFalseAnswerService = inject(QuizTrueFalseAnswerService);
  questionResults = QuestionResult;

  variant: Variant = 'default';

  ngOnInit(): void {
    this.quizTrueFalseAnswerService.setQuestion(this.question);
    this.quizTrueFalseAnswerService.setValue(this.value);
    this.quizTrueFalseAnswerService.showAnswer$.subscribe((show) => {
      this.showAnswer = show;
    });
  }

  getVariant(): Variant {
    if (this.showAnswer) {
      if (this.quizTrueFalseAnswerService.isCorrectChoice()) return 'correct';
      if (this.quizTrueFalseAnswerService.isIncorrectChoice())
        return 'incorrect';
      if (this.quizTrueFalseAnswerService.isMissingChoice()) return 'missing';
    }
    return this.quizTrueFalseAnswerService.isSelectedChoice()
      ? 'selected'
      : 'default';
  }

  handleClick() {
    if (this.showAnswer) return;

    this.quizTrueFalseAnswerService.answerTheQuestion(
      this.question.id,
      this.value
    );
  }

  getAnswerText() {
    return this.value ? 'True' : 'False';
  }

  isSelectedChoice(): boolean {
    return this.quizTrueFalseAnswerService.isSelectedChoice();
  }

  getFeedback(): string {
    if (!this.showAnswer) return '';
    const data = this.question.data as TrueFalseQuestion;
    if (!data) return '';
    
    const feedback = this.value ? data.feedbackOfTrue : data.feedbackOfFalse;
    
    // Provide fallback messages if feedback is null or empty
    if (!feedback) {
      const isCorrect = this.quizTrueFalseAnswerService.isCorrectChoice();
      return isCorrect ? 'Great Job' : 'Try Again';
    }
    
    return feedback;
  }

  shouldShowFeedback(): boolean {
    return this.showAnswer && this.isSelectedChoice();
  }
}
