import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { StudentResponseService } from '@shared/services/student-response.service';
import { AssignmentTopic } from '@shared/models/topic';
import { formatDateString } from '@shared/helper/date.helper';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { AssignmentTab } from '@modules/assignment/constants/assignment.constant';
import { GetAllAssignmentResponsesOfTopic } from '@modules/assignment/api/assignment-response.api';
import { StudentResponse } from '@shared/models/student-response';
import { Course } from '@shared/models/course';
import { CloudinaryFile } from '@shared/models/cloudinary-file';
import { AssignmentData } from '@shared/models/assignment';
import { Comment } from '@shared/models/comment';
import { getComments, createComment } from '@shared/api/comment.api';
import { User } from '@shared/models/user';
import { UserService } from '@shared/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'tab-assignment',
  standalone: false,
  templateUrl: './tab-assignment.component.html',
  styleUrl: './tab-assignment.component.scss',
  providers: [StudentResponseService],
})
export class TabAssignmentComponent implements OnInit, OnChanges {
  @Input({ required: true }) topic!: AssignmentTopic;
  @Input() course!: Course;

  studentResponses: StudentResponse[] = [];
  uploadedFiles: CloudinaryFile[] = [];

  // Comment functionality
  comments: Comment[] = [];
  newCommentText: string = '';
  currentUser: User | null = null;
  courseId: string | null = null;

  constructor(
    private tabService: TabService<string>,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
  }

  ngOnInit(): void {
    this.currentUser = this.userService.getUser();
    this.fetchAssignmentResponses();
    this.fetchComments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topic'] && this.topic) {
      const assignmentData = this.topic.data as AssignmentData;
      this.uploadedFiles = assignmentData.cloudinaryFiles ?? [];
    }
  }

  get assignedCount(): number {
    return this.course && this.course.students
      ? this.course.students.length
      : 0;
  }

  get submittedCount(): number {
    return this.studentResponses.length;
  }

  get needGradingCount(): number {
    return this.studentResponses.filter((res) => {
      const data = res.data as any;
      return !data || data.mark === null || data.mark === undefined;
    }).length;
  }

  async fetchAssignmentResponses() {
    try {
      this.studentResponses = await GetAllAssignmentResponsesOfTopic(
        this.topic.id
      );
    } catch (error) {
      throw error;
    }
  }

  formatDate(date: string | null, pattern: string = 'MM/dd/yyyy HH:mm a') {
    return formatDateString(date, pattern);
  }

  onGradeBtnClick() {
    this.tabService.selectTab(AssignmentTab.SUBMISSIONS);
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
        error: (err) => console.error('✗ Error sending notification to creator:', err)
      });
    }

    // Send to all students
    if (this.course.students) {
      console.log('Sending notifications to students:', this.course.students.length);
      this.course.students.forEach(student => {
        if (student.id !== this.currentUser?.id) {
          console.log('Sending notification to student:', student.id);
          this.notificationService.createNotification(
            student.id,
            title,
            message
          ).subscribe({
            next: () => console.log('✓ Notification sent to student:', student.id),
            error: (err) => console.error('✗ Error sending notification to student:', err)
          });
        }
      });
    }
  }
}
