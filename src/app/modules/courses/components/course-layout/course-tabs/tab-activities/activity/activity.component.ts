import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Section } from '@shared/models/course';
import {
  AssignmentTopic,
  QuizTopic,
  Topic,
  TopicType,
  iconMap,
} from '@shared/models/topic';
import { User } from '@shared/models/user';
import { format, differenceInCalendarDays, isAfter } from 'date-fns';

@Component({
  selector: 'app-activity',
  standalone: false,
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})
export class ActivityComponent implements OnInit {
  @Input({ required: true }) section!: Section;
  @Input({ required: false }) user!: User | null;
  router = inject(Router);
  dueText: string | null = null;
  iconMap = iconMap;
  constructor() {}

  ngOnInit() {}

  getDueParts(
    topic: Topic
  ): { date: string; status?: string; overdue?: boolean } | null {
    if (topic.type !== TopicType.ASSIGNMENT && topic.type !== TopicType.QUIZ)
      return null;
    const close = (topic as AssignmentTopic | QuizTopic).data?.close;
    if (!close) return null;

    const closeDate = new Date(close);
    const now = new Date();
    const formattedDate = `Due ${format(closeDate, 'MMM d')}`;

    // If user is not passed, only show date
    if (!this.user) {
      return { date: formattedDate };
    }

    if (isAfter(now, closeDate)) {
      return { date: formattedDate, status: 'Overdue', overdue: true };
    } else {
      const daysLeft = differenceInCalendarDays(closeDate, now);
      return {
        date: formattedDate,
        status: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`,
        overdue: false,
      };
    }
  }

  setUnderline(event: Event, underline: boolean) {
    const target = event.target as HTMLElement;
    target.style.textDecoration = underline ? 'underline' : 'none';
  }

  onTopicClick(topic: Topic): void {
    this.router.navigate([
      `${this.router.url}/${topic.type}/${topic.id}`,
    ]);
  }
}
