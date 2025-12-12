import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetCourseById } from '@modules/courses/api/courses.api';
import { GetTopic } from '@modules/courses/api/topic.api';
import { getCharacter } from '@shared/helper/string.helper';
import { Course } from '@shared/models/course';
import { Question, QuestionType } from '@shared/models/question';
import { getSecondFromTimeLimitType } from '@shared/models/quiz';
import { QuizTopic } from '@shared/models/topic';
import { debounceTime } from 'rxjs';
import { QuizAttemptingService } from './quiz-attempting.service';
import { GetQuizResponse } from '@modules/quiz/api/quiz-response.api';
import { ToastrService } from 'ngx-toastr';
import { QuizResponseData } from '@shared/models/student-response';

@Component({
  selector: 'quiz-attempting',
  standalone: false,
  templateUrl: './quiz-attempting.component.html',
  styleUrl: './quiz-attempting.component.scss',
  providers: [QuizAttemptingService],
})
export class QuizAttemptingComponent implements OnInit {
  constructor(
    private quizAttemptingService: QuizAttemptingService,
    private activedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {}
  topic: QuizTopic | null = null;
  course: Course | null = null;
  questions: Question[] = [];
  questionTypes = QuestionType;

  answerRecord: Record<string, string> = {};
  flaggedQuestions: string[] = [];

  isReviewMode = false;
  currentQuestionId = '';
  showAnswer = false;

  ngOnInit(): void {
    this.quizAttemptingService.questions$.subscribe((questions) => {
      this.questions = questions;
    });
    this.quizAttemptingService.currentQuestionId$.subscribe((id) => {
      this.currentQuestionId = id;
    });
    this.quizAttemptingService.answerRecord$
      .pipe(debounceTime(200))
      .subscribe((answers) => {
        this.answerRecord = answers;
      });
    this.quizAttemptingService.showAnswer$.subscribe((show) => {
      this.showAnswer = show;
    });
    this.quizAttemptingService.flaggedQuestions$.subscribe((flagged) => {
      this.flaggedQuestions = flagged;
    });
    this.InitData();
  }

  async InitData() {
    const topicId = this.activedRoute.snapshot.paramMap.get('topicId');
    const courseId = this.activedRoute.snapshot.paramMap.get('courseId');
    const quizResponseId =
      this.activedRoute.snapshot.paramMap.get('quizResponseId');
    if (topicId && courseId && quizResponseId) {
      await this.InitReviewModeData(courseId, topicId, quizResponseId);
    } else {
      await this.InitAttemptingModeData(courseId!, topicId!);
    }
  }

  async InitReviewModeData(
    courseId: string,
    topicId: string,
    quizResponseId: string
  ) {
    const resQuizResponse = this.FetchQuizResponse(topicId, quizResponseId);
    const resCourseAndTopicData = this.FetchCourseAndTopicData(
      courseId,
      topicId
    );
    await Promise.all([resQuizResponse, resCourseAndTopicData]).then(
      ([quizResponse, topic]) => {
        const quiz = topic as QuizTopic;
        this.InitFirstQuizDisplayData(quiz);
        if (quizResponse) {
          const quizResponseData = quizResponse.data as QuizResponseData;
          this.quizAttemptingService.setAnswerRecordFromQuizAnswers(
            quizResponseData.answers
          );
          this.quizAttemptingService.setStudentResponse(quizResponse);
          this.quizAttemptingService.setShowAnswer(true);
          this.isReviewMode = true;
        }
      }
    );
  }

  InitFirstQuizDisplayData(topic: QuizTopic) {
    // Convert questions to proper format if they're in flat structure
    const questions = topic.data.questions.map(q => this.normalizeQuestion(q));
    this.quizAttemptingService.setQuestions(questions);
    this.quizAttemptingService.setCurrentQuestionId(questions[0].id);
  }

  // Normalize question structure - convert flat backend format to nested frontend format
  normalizeQuestion(question: Question): Question {
    const flatData = question as any;
    
    // If already in correct nested format, return as-is
    if (question.data && typeof question.data === 'object' && 
        (question.data.hasOwnProperty('choices') || question.data.hasOwnProperty('correctAnswer'))) {
      return question;
    }
    
    // Convert flat structure to nested
    if (question.type === QuestionType.TRUE_FALSE || flatData.type === 'True/False') {
      return {
        ...question,
        type: QuestionType.TRUE_FALSE,
        data: {
          correctAnswer: flatData.correctAnswer ?? false,
          feedbackOfTrue: flatData.feedbackOfTrue || '',
          feedbackOfFalse: flatData.feedbackOfFalse || ''
        }
      };
    } else if (question.type === QuestionType.CHOICE || flatData.type === 'Choices Answer') {
      return {
        ...question,
        type: QuestionType.CHOICE,
        data: {
          multiple: flatData.multiple ?? false,
          choices: flatData.choices || []
        }
      };
    } else if (question.type === QuestionType.SHORT_ANSWER || flatData.type === 'Short Answer') {
      return {
        ...question,
        type: QuestionType.SHORT_ANSWER,
        data: {
          choices: flatData.choices || []
        }
      };
    }
    
    return question;
  }

  async InitAttemptingModeData(courseId: string, topicId: string) {
    await this.FetchCourseAndTopicData(courseId, topicId).then((topic) => {
      const quiz = topic as QuizTopic;
      this.InitFirstQuizDisplayData(quiz);
      if (this.hasLimitTime(quiz)) {
        const countDown = this.getCountDown(quiz);
        this.quizAttemptingService.startQuiz(topicId, countDown);
      } else {
        this.quizAttemptingService.startQuiz(topicId);
      }
    });
  }

  async FetchCourseAndTopicData(courseId: string, topicId: string) {
    return await GetCourseById(courseId).then(async (course) => {
      this.course = course;
      return await GetTopic(topicId, courseId).then((topic) => {
        this.topic = topic as QuizTopic;
        return topic;
      });
    });
  }

  async FetchQuizResponse(topicId: string, id: string) {
    return await GetQuizResponse(topicId, id).catch((error) => {
      this.toastr.error(error.message);
      console.error('Error fetching quiz response:', error);
    });
  }

  hasLimitTime(quiz: QuizTopic): boolean {
    return !!quiz.data.timeLimit;
  }

  getCountDown(quiz: QuizTopic): number {
    const timeLimit = quiz.data.timeLimit;
    if (!timeLimit) return 0;

    const timeLimitUnit = quiz.data.timeLimitUnit;
    return getSecondFromTimeLimitType(timeLimit, timeLimitUnit);
  }

  isMultipleChoice(question: Question): boolean {
    return this.quizAttemptingService.isMultipleChoice(question);
  }

  getChoices(question: Question) {
    return this.quizAttemptingService.getChoices(question);
  }

  getCharacter(index: number): string {
    return getCharacter(index);
  }

  flagQuestion(question: Question) {
    this.quizAttemptingService.flagQuestion(question.id);
  }

  getCurrentQuestionFeedback(): string {
    const currentQuestion = this.questions.find(q => q.id === this.currentQuestionId);
    if (!currentQuestion || !this.isReviewMode) return '';

    return this.quizAttemptingService.getQuestionFeedback(currentQuestion);
  }

  shouldShowFeedback(): boolean {
    return this.isReviewMode && this.showAnswer;
  }

  isCurrentAnswerCorrect(): boolean {
    const currentQuestion = this.questions.find(q => q.id === this.currentQuestionId);
    if (!currentQuestion) return false;
    return this.quizAttemptingService.isQuestionAnsweredCorrectly(currentQuestion);
  }
}
