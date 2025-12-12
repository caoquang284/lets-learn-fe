import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ConfirmMessageData,
  ConfirmMessageService,
} from '@shared/components/confirm-message/confirm-message.service';
import { formatDateString, isInDate } from '@shared/helper/date.helper';
import { mockStudentResponses } from '@shared/mocks/student-response';
import { GradingMethod } from '@shared/models/quiz';
import { QuizTopic } from '@shared/models/topic';
import { StudentResponseService } from '@shared/services/student-response.service';
import { TabQuizService } from '../tab-quiz/tab-quiz.service';
import { Course } from '@shared/models/course';
import { ToastrService } from 'ngx-toastr';
import { GetAllQuizResponsesOfTopic } from '@modules/quiz/api/quiz-response.api';
import { StudentResponse } from '@shared/models/student-response';
import { UserService } from '@shared/services/user.service';
import { Comment } from '@shared/models/comment';
import { getComments, createComment } from '@shared/api/comment.api';
import { NotificationService } from '@shared/services/notification.service';
import { User } from '@shared/models/user';

@Component({
  selector: 'tab-quiz-student',
  standalone: false,
  templateUrl: './tab-quiz-student.component.html',
  styleUrl: './tab-quiz-student.component.scss',
  providers: [TabQuizService, StudentResponseService],
})
export class TabQuizStudentComponent implements OnInit {
  @Input({ required: true }) topic!: QuizTopic;
  @Input({ required: true }) course!: Course;

  studentResponses = mockStudentResponses;
  gradingMethod: GradingMethod = GradingMethod.HIGHEST_GRADE;
  gradeToShow = 0;
  fullMarkOfQuiz = 100;
  gradeColor = 'green';

  // Comment functionality
  comments: Comment[] = [];
  newCommentText: string = '';
  currentUser: any = null;
  courseId: string | null = null;

  constructor(
    private tabQuizService: TabQuizService,
    private studentResponseService: StudentResponseService,
    private router: Router,
    private confirmMessageService: ConfirmMessageService,
    private toastr: ToastrService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
  }

  confirmMessageData: ConfirmMessageData = {
    title: 'This quiz has time limit',
    message:
      "Are you sure you want to start this quiz? You can't pause the quiz and the time will keep counting down.",
    variant: 'warning',
  };

  openConfirmMessage() {
    if (!this.checkValidQuiz()) return;
    this.confirmMessageService.openDialog();
  }

  onCancelConfirmMessage() {
    this.confirmMessageService.closeDialog();
  }

  onAcceptConfirmMessage() {
    this.confirmMessageService.closeDialog();
    this.startQuiz();
  }

  ngOnInit(): void {
    this.currentUser = this.userService.getUser();
    this.fetchData();
    this.confirmMessageService.setData(this.confirmMessageData);
    this.confirmMessageService.setCancelAction(() =>
      this.onCancelConfirmMessage()
    );
    this.confirmMessageService.setConfirmAction(() =>
      this.onAcceptConfirmMessage()
    );
    this.tabQuizService.topic$.subscribe((topic) => {
      if (!topic) return;
      this.topic = topic;
      this.updateGradingDisplayData(this.studentResponses);
    });
    this.tabQuizService.setTopic(this.topic);
    this.fetchComments();
  }

  async fetchData() {
    await GetAllQuizResponsesOfTopic(this.topic.id)
      .then((responses) => {
        // Filter responses to only current userAdd commentMore actions
        const currentUser = this.userService.getUser();
        const filteredResponses = currentUser
          ? responses.filter((r) => r.studentId === currentUser.id)
          : [];
        this.updateGradingDisplayData(filteredResponses);
      })
      .catch((error) => {
        console.error('Failed to fetch quiz responses:', error);
        this.toastr.error(error.message);
      });
  }

  updateGradingDisplayData(quizResponses: StudentResponse[]) {
    const currentUser = this.userService.getUser();
    this.studentResponses = currentUser
      ? quizResponses.filter((r) => r.studentId === currentUser.id)
      : [];

    if (!this.topic || !this.topic.data) {
      this.toastr.error('Quiz is not available.');
      return;
    }
    this.fullMarkOfQuiz = this.tabQuizService.getFullMarkOfQuiz(this.topic);
    this.gradingMethod = this.topic.data.gradingMethod;

    if (this.gradingMethod === GradingMethod.FIRST_GRADE) {
      this.gradeToShow = this.tabQuizService.getFirstAttemptGrade(
        this.studentResponses
      );
    } else if (this.gradingMethod === GradingMethod.LAST_GRADE) {
      this.gradeToShow = this.tabQuizService.getLastAttemptGrade(
        this.studentResponses
      );
    } else if (this.gradingMethod === GradingMethod.AVERAGE_GRADE) {
      this.gradeToShow = this.tabQuizService.getAverageGrade(
        this.studentResponses
      );
    } else {
      this.gradeToShow = this.tabQuizService.getHighestGrade(
        this.studentResponses
      );
    }

    this.gradeColor = this.studentResponseService.getGradeColor(
      this.gradeToShow,
      this.fullMarkOfQuiz
    );
  }

  formatDate(date: string | null, pattern: string = 'MM/dd/yyyy HH:mm a') {
    return formatDateString(date, pattern);
  }

  checkValidQuiz(): boolean {
    if (!this.topic || !this.topic.data) {
      this.toastr.error('Quiz is not available.');
      return false;
    }
    if (this.topic.data.questions.length === 0) {
      this.toastr.error('This quiz has no questions.');
      return false;
    }
    return true;
  }

  startQuiz() {
    this.router.navigate([
      `courses/${this.course.id}/quiz/${this.topic.id}/attempting`,
    ]);
  }

  onReviewClick(responseId: string) {
    this.router.navigate([
      `courses/${this.course.id}/quiz/${this.topic.id}/${responseId}/reviewing`,
    ]);
  }

  async fetchComments(): Promise<void> {
    if (!this.courseId || !this.topic?.id) return;
    
    try {
      this.comments = await getComments(this.courseId, this.topic.id);
    } catch (error) {
      console.error('Error fetching comments:', error);
      this.comments = [];
    }
  }

  getAuthorName(comment: Comment): string {
    return comment.user?.username || 'Unknown User';
  }

  getAvatar(comment: Comment): string {
    return comment.user?.avatar || 'https://via.placeholder.com/40/607D8B/FFFFFF?text=?';
  }

  getCurrentUserAvatar(): string {
    return this.currentUser?.avatar || 'https://via.placeholder.com/40/607D8B/FFFFFF?text=You';
  }

  async addComment(): Promise<void> {
    if (!this.newCommentText.trim() || !this.courseId || !this.topic?.id) return;
    
    try {
      const newComment = await createComment(
        this.courseId,
        this.topic.id,
        { text: this.newCommentText.trim() }
      );
      
      this.comments = [...this.comments, newComment];
      this.newCommentText = '';

      // Send notification to all course participants
      this.sendNotificationToCourseParticipants(newComment.text);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }

  private sendNotificationToCourseParticipants(commentText: string): void {
    if (!this.course || !this.currentUser) {
      console.warn('Cannot send notifications: course or currentUser is missing', { course: this.course, currentUser: this.currentUser });
      return;
    }

    console.log('Sending notifications for comment:', commentText);
    const title = 'New Comment';
    const message = `${this.currentUser.username} commented: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`;

    // Send to teacher/creator
    if (this.course.creator && this.course.creator.id !== this.currentUser.id) {
      console.log('Sending notification to creator:', this.course.creator.id);
      this.notificationService.createNotification(
        this.course.creator.id,
        title,
        message
      ).subscribe({
        next: () => console.log('✓ Notification sent to creator'),
        error: (err: any) => console.error('✗ Error sending notification to creator:', err)
      });
    }

    // Send to all students
    if (this.course.students) {
      console.log('Sending notifications to students:', this.course.students.length);
      this.course.students.forEach((student: User) => {
        if (student.id !== this.currentUser?.id) {
          console.log('Sending notification to student:', student.id);
          this.notificationService.createNotification(
            student.id,
            title,
            message
          ).subscribe({
            next: () => console.log('✓ Notification sent to student:', student.id),
            error: (err: any) => console.error('✗ Error sending notification to student:', err)
          });
        }
      });
    }
  }
}
