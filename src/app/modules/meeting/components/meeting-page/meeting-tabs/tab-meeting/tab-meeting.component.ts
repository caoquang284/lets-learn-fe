import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { MeetingTopic } from '@shared/models/topic';
import { MeetingComment, MeetingData } from '@shared/models/meeting';
import { mockMeetingData, mockMeetingComments } from '@shared/mocks/meeting';

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
  }

  private updateMeetingInfo(): void {
    this.meetingDescription = this.topic?.data?.description || this.meetingData?.description || null;
    this.meetingOpenDate = this.topic?.data?.meetingDate || this.meetingData?.meetingDate || null;
    this.meetingUrl = this.meetingData?.meetingUrl || null;
    this.isActive = this.meetingData?.isActive || false;
    this.hasMeeting = !!(this.meetingDescription || this.meetingOpenDate);
  }

  addComment(): void {
    if (this.newCommentText.trim()) {
      const newComment: MeetingComment = {
        id: Date.now().toString(),
        author: 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: this.newCommentText.trim(),
        avatar: 'https://via.placeholder.com/40/607D8B/FFFFFF?text=You',
        userId: 'current-user'
      };
      
      this.comments.push(newComment);
      this.newCommentText = '';
    }
  }

  joinMeeting(): void {
    if (this.meetingUrl) {
      window.open(this.meetingUrl, '_blank');
    } else {
      console.log('Meeting URL not available');
    }
  }

  isMeetingTime(): boolean {
    if (!this.meetingOpenDate) return false;
    const now = new Date();
    const meetingTime = new Date(this.meetingOpenDate);
    const timeDiff = meetingTime.getTime() - now.getTime();
    // Meeting is considered "live" if it's within 15 minutes before or 2 hours after start time
    return timeDiff >= -15 * 60 * 1000 && timeDiff <= 2 * 60 * 60 * 1000;
  }

  getMeetingStatus(): string {
    if (!this.meetingOpenDate) return 'No date set';
    
    const now = new Date();
    const meetingTime = new Date(this.meetingOpenDate);
    const timeDiff = meetingTime.getTime() - now.getTime();
    
    if (timeDiff > 2 * 60 * 60 * 1000) {
      return 'Scheduled';
    } else if (timeDiff > 0) {
      return 'Starting soon';
    } else if (timeDiff >= -2 * 60 * 60 * 1000) {
      return 'Live now';
    } else {
      return 'Ended';
    }
  }
}