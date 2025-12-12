import { Injectable } from '@angular/core';
import { CreateQuizResponse } from '@modules/quiz/api/quiz-response.api';
import { QuestionResult } from '@modules/quiz/constants/quiz.constant';
import { TimerService } from '@shared/components/timer/timer.service';
import {
  ChoiceQuestion,
  Question,
  QuestionType,
} from '@shared/models/question';
import {
  QuizAnswer,
  QuizStatus,
  StudentResponse,
} from '@shared/models/student-response';
import { QuestionService } from '@shared/services/question.service';
import { QuizService } from '@shared/services/quiz.service';
import { StudentResponseService } from '@shared/services/student-response.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class QuizAttemptingService {
  private questions = new BehaviorSubject<Question[]>([]);
  public questions$ = this.questions.asObservable();

  private currentQuestionId = new BehaviorSubject<string>('');
  public currentQuestionId$ = this.currentQuestionId.asObservable();

  private answerRecord = new BehaviorSubject<Record<string, any>>({});
  public answerRecord$ = this.answerRecord.asObservable();

  private showAnswer = new BehaviorSubject<boolean>(false);
  public showAnswer$ = this.showAnswer.asObservable();

  private flaggedQuestions = new BehaviorSubject<string[]>([]);
  public flaggedQuestions$ = this.flaggedQuestions.asObservable();

  private studentResponse = new BehaviorSubject<StudentResponse | null>(null);
  public studentResponse$ = this.studentResponse.asObservable();

  private topicId: string | null = null;

  constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private studentResponseService: StudentResponseService,
    private timerService: TimerService,
    private toastService: ToastrService
  ) {}

  startQuiz(topicId: string, countDown?: number) {
    this.timerService.setTimerType(countDown ? 'count-down' : 'count-up');
    this.timerService.setCountDown(countDown ?? 0);
    this.timerService.start();
    const init = this.studentResponseService.getInitQuizResponse(topicId);
    this.topicId = topicId;
    this.studentResponse.next(init);
  }

  setCurrentQuestionId(id: string) {
    this.currentQuestionId.next(id);
  }

  setQuestions(questions: Question[]) {
    this.questions.next(questions);
  }

  setAnswerRecord(answer: Record<string, string>) {
    this.answerRecord.next(answer);
  }

  setShowAnswer(show: boolean) {
    this.showAnswer.next(show);
  }

  findQuestion(questionId: string): Question | undefined {
    return this.questions.value.find((q) => q.id === questionId);
  }

  //multiple choice -> save choiceId in string[]
  // choice or true false question -> choiceId
  // short question -> text
  answerTheQuestion(questionId: string, answer: string) {
    const currentAnswers = this.answerRecord.value;
    const question = this.findQuestion(questionId);
    if (!question) return;

    let updatedAnswers;
    if (this.isMultipleChoice(question)) {
      let answers = currentAnswers[questionId] ?? [];
      let updatedAnswer;

      if (answers.includes(answer)) {
        updatedAnswer = answers.filter((id: string) => id !== answer);
      } else {
        updatedAnswer = [...answers, answer];
      }

      updatedAnswers = { ...currentAnswers, [questionId]: updatedAnswer };
    } else {
      updatedAnswers = { ...currentAnswers, [questionId]: answer };
    }
    this.answerRecord.next(updatedAnswers);
  }

  isMultipleChoice(question: Question): boolean {
    if (question.type !== QuestionType.CHOICE) return false;
    // Handle both nested data structure and flat structure from API
    const data = question.data as ChoiceQuestion;
    const flatMultiple = (question as any).multiple;
    return data?.multiple ?? flatMultiple ?? false;
  }

  isSelectedChoice(questionId: string, answer: string): boolean {
    const question = this.findQuestion(questionId);
    if (!question) return false;

    const records = this.answerRecord.value;
    if (this.isMultipleChoice(question)) {
      const answers = records[questionId] ?? [];
      return answers.includes(answer);
    }

    return records[questionId] === answer;
  }

  isAnswered(questionId: string): boolean {
    const question = this.findQuestion(questionId);
    if (!question) return false;

    const records = this.answerRecord.value;
    return !!records[questionId];
  }

  hasAnsweredAll(): boolean {
    const records = this.answerRecord.value;
    const questionIds = this.questions.value.map((q) => q.id);

    return questionIds.every((id) => !!records[id]);
  }

  getAnswer(questionId: string) {
    const question = this.findQuestion(questionId);
    if (!question) return '';

    const records = this.answerRecord.value;
    if (this.isMultipleChoice(question)) {
      return records[questionId] ?? [];
    }

    return records[questionId] ?? '';
  }

  getChoices(question: Question) {
    return this.questionService.getChoices(question);
  }

  getQuestionResult(questionId: string): QuestionResult {
    const question = this.findQuestion(questionId);
    if (!question) return QuestionResult.ZERO_MARK;

    const records = this.answerRecord.value;
    const answer = records[questionId] ?? '';
    let mark = this.questionService.getQuestionMark(question, answer);
    return this.quizService.getQuestionResultFromMark(
      mark,
      question.defaultMark
    );
  }

  isFlagged(questionId: string): boolean {
    const flaggedQuestions = this.flaggedQuestions.value;
    return flaggedQuestions.includes(questionId);
  }

  flagQuestion(questionId: string) {
    const flaggedQuestions = this.flaggedQuestions.value;
    let updated: string[] = [];
    const isFlagged = this.isFlagged(questionId);

    if (isFlagged) updated = flaggedQuestions.filter((id) => id !== questionId);
    else updated = [...flaggedQuestions, questionId];

    this.flaggedQuestions.next(updated);
  }

  getQuizAnswers(): QuizAnswer[] {
    const records = this.answerRecord.value;
    const questions = this.questions.value;
    const quizAnswers: QuizAnswer[] = [];

    questions.forEach((question) => {
      const answer = records[question.id] ?? '';
      quizAnswers.push({
        question: question,
        answer: this.questionService.convertToHashAnswer(question, answer),
        mark: this.questionService.getQuestionMark(question, answer),
      });
    });

    return quizAnswers;
  }
  setAnswerRecordFromQuizAnswers(quizAnsers: QuizAnswer[]) {
    const answerRecord: Record<string, any> = {};
    quizAnsers.forEach((quizAnswer) => {
      const questionId = quizAnswer.question.id;
      answerRecord[questionId] = this.questionService.parseFromHashAnswer(
        quizAnswer.question,
        quizAnswer.answer
      );
    });
    this.answerRecord.next(answerRecord);
    this.setShowAnswer(true);
  }
  setStudentResponse(response: StudentResponse) {
    this.studentResponse.next(response);
  }

  getQuestionFeedback(question: Question): string {
    if (!question || !question.data) return 'Try Again';
    
    const answer = this.getAnswer(question.id);
    
    // If no answer provided, return default feedback
    if (!answer || answer === '') {
      return 'Try Again';
    }
    
    if (question.type === QuestionType.TRUE_FALSE) {
      const data = question.data as any;
      if (!data) return 'Try Again';
      
      const selectedValue = answer === '1';
      const feedback = selectedValue ? (data.feedbackOfTrue || '') : (data.feedbackOfFalse || '');
      const isCorrect = this.questionService.getQuestionMark(question, answer) > 0;
      
      // Return stored feedback if exists, otherwise return default based on correctness
      return feedback || (isCorrect ? 'Great Job' : 'Try Again');
    } else if (question.type === QuestionType.CHOICE) {
      const choices = this.getChoices(question);
      if (!choices || choices.length === 0) return 'Try Again';
      
      const isMultiple = this.isMultipleChoice(question);
      
      if (isMultiple) {
        const selectedIds = answer as string[];
        if (!selectedIds || selectedIds.length === 0) return 'Try Again';
        
        const selectedChoices = choices.filter(c => selectedIds.includes(c.id));
        const feedbacks = selectedChoices.map(c => c.feedback).filter(f => f);
        const isCorrect = this.questionService.getQuestionMark(question, answer) === question.defaultMark;
        
        // Return stored feedbacks if exist, otherwise return default based on correctness
        return feedbacks.length > 0 ? feedbacks.join(' ') : (isCorrect ? 'Great Job' : 'Try Again');
      } else {
        const selectedChoice = choices.find(c => c.id === answer);
        const isCorrect = this.questionService.getQuestionMark(question, answer) > 0;
        
        // Return stored feedback if exists, otherwise return default based on correctness
        return selectedChoice?.feedback || (isCorrect ? 'Great Job' : 'Try Again');
      }
    }
    
    return 'Try Again';
  }

  isQuestionAnsweredCorrectly(question: Question): boolean {
    const answer = this.getAnswer(question.id);
    const mark = this.questionService.getQuestionMark(question, answer);
    return mark === question.defaultMark;
  }

  async finishQuiz() {
    const studentResponse = this.studentResponse.value;
    if (!studentResponse || !this.topicId) return;

    this.setShowAnswer(true);
    const quizAnswers = this.getQuizAnswers();
    const startTime = this.timerService.getStartTime();
    const completeTime = this.timerService.stop();

    const updatedStudentResponse: StudentResponse = {
      ...studentResponse,
      data: {
        ...studentResponse.data,
        status: QuizStatus.FINISHED,
        answers: quizAnswers,
        startedAt: startTime.toISOString(),
        completedAt: completeTime.toISOString(),
      },
    };

    this.studentResponse.next(updatedStudentResponse);
    return await CreateQuizResponse(this.topicId, updatedStudentResponse)
      .then(() => {
        this.toastService.success('Your quiz has been submitted successfully!');
      })
      .catch((error) => {
        this.toastService.error(error.message);
      });
  }
}
