import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { formatDateString } from '@shared/helper/date.helper';
import { MeetingTopic } from '@shared/models/topic';
import { MeetingComment, MeetingData } from '@shared/models/meeting';
import { mockMeetingData, mockMeetingComments, getUserById } from '@shared/mocks/meeting';
import { User } from '@shared/models/user';

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
  meetingOpenDate: Date | null = null;
  meetingUrl: string | null = null;
  isActive: boolean = false;
  
  // Meeting data and comments
  meetingData: MeetingData | null = null;
  comments: MeetingComment[] = [];
  newCommentText: string = '';
  currentUser: User | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadMeetingData();
    this.updateMeetingInfo();
  }

  ngOnChanges(): void {
    this.updateMeetingInfo();
  }

  private loadMeetingData(): void {
    // In real app, this would fetch data based on topic.id
    // For now, use first mock data
    this.meetingData = mockMeetingData[0];
    this.comments = [...mockMeetingComments];
    // Load current user (in real app, from auth service)
    this.currentUser = getUserById('1') || null;
  }

  private updateMeetingInfo(): void {
    this.meetingDescription = this.topic?.data?.description || this.meetingData?.description || null;
    this.meetingOpenDate = this.topic?.data?.meetingDate || this.meetingData?.meetingDate || null;
    this.meetingUrl = this.meetingData?.meetingUrl || null;
    this.isActive = this.meetingData?.isActive || false;
    this.hasMeeting = !!(this.meetingDescription || this.meetingOpenDate);
  }

  formatDate(date: string | Date | null, pattern: string = 'EEEE, dd MMMM yyyy HH:mm a') {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDateString(dateObj.toISOString(), pattern);
  }

  // Helper method to get user info by userId
  getUserById(userId: string): User | undefined {
    return getUserById(userId);
  }

  // Helper method to get author name from userId
  getAuthorName(userId: string): string {
    const user = this.getUserById(userId);
    return user?.username || 'Unknown User';
  }

  // Helper method to get avatar from userId
  getAvatar(userId: string): string {
    const user = this.getUserById(userId);
    return user?.avatar || 'https://via.placeholder.com/40/607D8B/FFFFFF?text=?';
  }

  // Get current user avatar for comment input
  getCurrentUserAvatar(): string {
    return this.currentUser?.avatar || 'https://via.placeholder.com/40/607D8B/FFFFFF?text=You';
  }

    // Method to add new comment
    addComment(): void {
      if (!this.newCommentText.trim()) return;
    
      const newComment: MeetingComment = {
        id: (this.comments.length + 1).toString(),
        userId: '1', // Current user - in real app this would come from auth service
        time: new Date().toLocaleString(),
        text: this.newCommentText.trim()
      };
    
      this.comments = [...this.comments, newComment];
      this.newCommentText = '';
    }
}
