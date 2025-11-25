import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ComboboxService } from '@shared/components/combobox/combobox.service';
import { ComboboxOption } from '@shared/components/combobox/combobox.type';
import {
  getStartDateOfWeek,
  getEndDateOfWeek,
} from '@shared/helper/date.helper';
import { Topic } from '@shared/models/topic';
import { CalendarRange } from '../calendar/calendar.type';
import { CalendarPageService } from './calendar-page.service';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { GetAllWorkingTopicsOfUser } from '@shared/api/user.api';

@Component({
  selector: 'calendar-page',
  standalone: false,
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss',
  providers: [ComboboxService, CalendarPageService],
})
export class CalendarPageComponent implements OnInit {
  courseOptions = signal<ComboboxOption[]>([
    { value: 'all', label: 'All courses' },
  ]);

  topics = signal<Topic[]>([]);
  selectedCourseId = signal<string>('all');
  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);

  calendarRange = signal<CalendarRange>({
    start: getStartDateOfWeek(new Date()),
    end: getEndDateOfWeek(new Date()),
  });

  calendarRangeText = computed(() =>
    this.calendarPageService.formatCalendarRange(this.calendarRange())
  );

  filteredTopics = computed(() => {
    const topics = this.topics();
    const selectedCourseId = this.selectedCourseId();
    
    if (selectedCourseId === 'all') return topics;
    return topics.filter(
      (topic: any) => topic.course && topic.course.id === selectedCourseId
    );
  });

  constructor(
    private calendarPageService: CalendarPageService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: 'Calendar',
        url: '/calendar',
        active: true,
      },
    ]);
  }

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);
    
    try {
      await this.loadTopics();
    } catch (error) {
      console.error('Error loading calendar data:', error);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadTopics(): Promise<void> {
    try {
      const startDate = this.calendarRange().start.toISOString();
      const endDate = this.calendarRange().end.toISOString();
      const topics = await GetAllWorkingTopicsOfUser(startDate, endDate);
      
      this.topics.set(topics);
      this.updateCourseOptions(topics);
    } catch (error) {
      console.error('Error loading topics:', error);
      this.hasError.set(true);
    }
  }

  private updateCourseOptions(topics: Topic[]): void {
    const courseOptions: ComboboxOption[] = [
      { value: 'all', label: 'All courses' },
    ];
    
    const checkIds: string[] = [];
    topics.forEach((topic) => {
      if (topic.course && !checkIds.includes(topic.course.id)) {
        courseOptions.push({ 
          value: topic.course.id, 
          label: topic.course.title 
        });
        checkIds.push(topic.course.id);
      }
    });
    
    this.courseOptions.set(courseOptions);
  }

  navigatePrevious(): void {
    const newDate = new Date(this.calendarRange().start);
    newDate.setDate(this.calendarRange().start.getDate() - 7);
    
    this.calendarRange.set({
      start: getStartDateOfWeek(newDate),
      end: getEndDateOfWeek(newDate),
    });
    this.loadTopics();
  }

  navigateNext(): void {
    const newDate = new Date(this.calendarRange().start);
    newDate.setDate(this.calendarRange().start.getDate() + 7);
    
    this.calendarRange.set({
      start: getStartDateOfWeek(newDate),
      end: getEndDateOfWeek(newDate),
    });
    this.loadTopics();
  }

  onSelectOption(option: ComboboxOption) {
    this.selectedCourseId.set(option.value);
  }

  retryLoad(): void {
    this.loadData();
  }
}
