import { Injectable } from '@angular/core';
import { Question, TrueFalseQuestion } from '@shared/models/question';
import { BehaviorSubject } from 'rxjs';
import { QuizAttemptingService } from '../quiz-attempting.service';

@Injectable()
export class QuizTrueFalseAnswerService {
  private choiceValue: boolean = false;
  private question: Question | null = null;

  private showAnswer = new BehaviorSubject<boolean>(false);
  public showAnswer$ = this.showAnswer.asObservable();

  private isSeleted = new BehaviorSubject<boolean>(false);
  public isSelected$ = this.isSeleted.asObservable();

  constructor(private quizAttemptingService: QuizAttemptingService) {
    this.quizAttemptingService.showAnswer$.subscribe((show) => {
      this.showAnswer.next(show);
    });
  }

  setValue(value: boolean) {
    this.choiceValue = value;
  }

  setQuestion(question: Question) {
    this.question = question;
  }

  isChoiceCorrect(): boolean {
    if (!this.question) return false;
    const data = this.question.data as TrueFalseQuestion;
    if (!data) return false;
    return this.choiceValue === data.correctAnswer;
  }

  isSelectedChoice(): boolean {
    if (!this.question) return false;
    const questionId = this.question.id;
    const strValue = this.choiceValue ? '1' : '0';
    return this.quizAttemptingService.isSelectedChoice(questionId, strValue);
  }

  isCorrectChoice(): boolean {
    const isSelected = this.isSelectedChoice();
    const isChoiceCorrect = this.isChoiceCorrect();
    return isSelected && isChoiceCorrect;
  }

  isIncorrectChoice(): boolean {
    const isSelected = this.isSelectedChoice();
    const isChoiceCorrect = this.isChoiceCorrect();
    return isSelected && !isChoiceCorrect;
  }

  isMissingChoice() {
    const isSelected = this.isSelectedChoice();
    const isChoiceCorrect = this.isChoiceCorrect();
    return !isSelected && isChoiceCorrect;
  }

  answerTheQuestion(questionId: string, value: boolean): void {
    const strValue = value ? '1' : '0';
    this.quizAttemptingService.answerTheQuestion(questionId, strValue);
  }
}
