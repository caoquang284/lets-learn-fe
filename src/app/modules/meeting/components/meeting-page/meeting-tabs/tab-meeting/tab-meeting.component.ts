import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { formatDateString } from '@shared/helper/date.helper';
import { MeetingTopic } from '@shared/models/topic';
import { MeetingData } from '@shared/models/meeting';
import { User } from '@shared/models/user';
import { Comment } from '@shared/models/comment';
import { getComments, createComment } from '@shared/api/comment.api';
import { UserService } from '@shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GetMeetingToken } from '@modules/meeting/api/meeting.api';
import { NotificationService } from '@shared/services/notification.service';
import { Course } from '@shared/models/course';

@Component({
  selector: 'tab-meeting',
  standalone: false,
  templateUrl: './tab-meeting.component.html',
  styleUrls: ['./tab-meeting.component.scss'],
})
export class TabMeetingComponent implements OnInit, OnChanges {
  @Input({ required: true }) topic!: MeetingTopic;
  @Input() course!: Course;

  hasMeeting: boolean = false;
  meetingDescription: string | null = null;
  meetingOpenDate: string | null = null;
  isJoining: boolean = false;
  
  // Meeting data and comments
  comments: Comment[] = [];
  newCommentText: string = '';
  currentUser: User | null = null;
  courseId: string | null = null;

  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
  }

  ngOnInit(): void {
    this.currentUser = this.userService.getUser();
    this.updateMeetingInfo();
    this.fetchComments();
  }

  ngOnChanges(): void {
    this.updateMeetingInfo();
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

  private updateMeetingInfo(): void {
    const meetingData = this.topic?.data as MeetingData;
    this.meetingDescription = meetingData?.description || null;
    this.meetingOpenDate = meetingData?.open || null;
    this.hasMeeting = !!(this.meetingDescription || this.meetingOpenDate);
  }

  formatDate(date: string | Date | null, pattern: string = 'EEEE, dd MMMM yyyy HH:mm a') {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDateString(dateObj.toISOString(), pattern);
  }

  // Helper method to get author name from comment
  getAuthorName(comment: Comment): string {
    return comment.user?.username || 'Unknown User';
  }

  // Helper method to get avatar from comment
  getAvatar(comment: Comment): string {
    return comment.user?.avatar || 'https://via.placeholder.com/40/607D8B/FFFFFF?text=?';
  }

  // Get current user avatar for comment input
  getCurrentUserAvatar(): string {
    return this.currentUser?.avatar || 'https://via.placeholder.com/40/607D8B/FFFFFF?text=You';
  }

  // Method to add new comment
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

  // Method to join meeting - fetches token then navigates to room
  async joinMeeting(): Promise<void> {
    if (!this.courseId || !this.topic?.id) {
      console.error('Missing courseId or topicId');
      return;
    }

    this.isJoining = true;

    try {
      // Pre-fetch the token to validate access and prepare the meeting
      await GetMeetingToken(this.topic.id, this.courseId);
      
      // Navigate to the meeting room with courseId in query params
      await this.router.navigate(['/meeting', this.topic.id, 'room'], {
        queryParams: { courseId: this.courseId }
      });
    } catch (error) {
      console.error('Failed to join meeting:', error);
      alert('Failed to join meeting. Please try again later.');
    } finally {
      this.isJoining = false;
    }
  }
}
