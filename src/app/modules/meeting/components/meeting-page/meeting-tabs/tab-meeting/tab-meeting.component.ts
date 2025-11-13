import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { formatDateString } from '@shared/helper/date.helper';
import { MeetingTopic } from '@shared/models/topic';
import { MeetingData } from '@shared/models/meeting';
import { User } from '@shared/models/user';
import { Comment } from '@shared/models/comment';
import { getComments, createComment } from '@shared/api/comment.api';
import { UserService } from '@shared/services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'tab-meeting',
  standalone: false,
  templateUrl: './tab-meeting.component.html',
  styleUrls: ['./tab-meeting.component.scss'],
})
export class TabMeetingComponent implements OnInit, OnChanges {
  @Input({ required: true }) topic!: MeetingTopic;

  hasMeeting: boolean = false;
  meetingDescription: string | null = null;
  meetingOpenDate: string | null = null;
  
  // Meeting data and comments
  comments: Comment[] = [];
  newCommentText: string = '';
  currentUser: User | null = null;
  courseId: string | null = null;

  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute
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
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }
}
