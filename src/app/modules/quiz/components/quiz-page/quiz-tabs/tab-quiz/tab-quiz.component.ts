import { Component, inject, Input, OnInit } from '@angular/core';
import { formatDateString } from '@shared/helper/date.helper';
import { GradingMethod } from '@shared/models/quiz';
import { QuizTopic } from '@shared/models/topic';
import { StudentResponseService } from '@shared/services/student-response.service';
import { TabQuizService } from './tab-quiz.service';
import { Comment } from '@shared/models/comment';
import { getComments, createComment } from '@shared/api/comment.api';
import { User } from '@shared/models/user';
import { UserService } from '@shared/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@shared/services/notification.service';
import { Course } from '@shared/models/course';

@Component({
  selector: 'tab-quiz',
  standalone: false,
  templateUrl: './tab-quiz.component.html',
  styleUrl: './tab-quiz.component.scss',
  providers: [TabQuizService, StudentResponseService],
})
export class TabQuizComponent implements OnInit {
  @Input({ required: true }) topic!: QuizTopic;
  @Input() course!: Course;

  gradingMethod: GradingMethod = GradingMethod.HIGHEST_GRADE;

  // Comment functionality
  comments: Comment[] = [];
  newCommentText: string = '';
  currentUser: User | null = null;
  courseId: string | null = null;

  private tabQuizService = inject(TabQuizService);
  private userService = inject(UserService);
  private activatedRoute = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
    this.currentUser = this.userService.getUser();
    this.tabQuizService.setTopic(this.topic);
    this.tabQuizService.topic$.subscribe((topic) => {
      if (!topic) return;
      this.topic = topic;
    });
    this.fetchComments();
  }

  formatDate(date: string | null, pattern: string = 'MM/dd/yyyy HH:mm a') {
    return formatDateString(date, pattern);
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
