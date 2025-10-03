import { Component, OnInit, signal } from '@angular/core';
import { ComboboxOption } from '@shared/components/combobox/combobox.type';
import { ComboboxService } from '@shared/components/combobox/combobox.service';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { ToReviewService } from './to-review.service';
import { ReviewItem } from '../../constants/to-review.constants';
import { Router } from '@angular/router';
import { isWorkingInProgressTopic, isClosedTopic, isNoDueDateTopic } from '../../helper/to-review.util';

@Component({
  selector: 'to-review-page',
  templateUrl: './to-review-page.component.html',
  styleUrls: ['./to-review-page.component.scss'],
  standalone: false,
  providers: [ComboboxService, CollapsibleListService],
})
export class ToReviewPageComponent implements OnInit {  
  courseOptions = signal<ComboboxOption[]>([
    { value: 'all', label: 'All courses' }
  ]);
  
  selectedCourse = signal<string>('all');
  sectionIds: string[] = ['work-in-progress', 'closed', 'no-due-date'];

  allReviewItems: ReviewItem[] = [];
  isLoading = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private collapsibleListService: CollapsibleListService,
    private toReviewService: ToReviewService,
    private router: Router,
  ) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: 'To Review',
        url: '/to-review',
        active: true,
      },
    ]);
  }

  async ngOnInit(): Promise<void> {
    this.collapsibleListService.setSectionIds(this.sectionIds);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.expandAll();
    
    
    await this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      this.allReviewItems = await this.toReviewService.getReviewItems();
      this.updateCourseOptions(this.allReviewItems);
    } catch (error) {
      console.error("Failed to load review items", error);
    } finally {
      this.isLoading = false;
    }
  }

  private updateCourseOptions(items: ReviewItem[]): void {
    const courseOptions: ComboboxOption[] = [
      { value: 'all', label: 'All courses' },
    ];
    const checkIds = new Set<string>();
    
    items.forEach(item => {
      const course = item.topic.course;
      if (course && !checkIds.has(course.id)) {
        courseOptions.push({ value: course.id, label: course.title });
        checkIds.add(course.id);
      }
    });
    
    this.courseOptions.set(courseOptions);
  }
  
  onSelectOption(option: ComboboxOption): void {
    this.selectedCourse.set(option.value);
  }  

  get filteredItemsByCourse(): ReviewItem[] {
    const courseId = this.selectedCourse();
    if (courseId === 'all') {
      return this.allReviewItems;
    }
    return this.allReviewItems.filter(item => item.topic.course?.id === courseId);
  }
  
  get workInProgressItems(): ReviewItem[] {
    return this.filteredItemsByCourse.filter(item => isWorkingInProgressTopic(item.topic));
  }

  get closedItems(): ReviewItem[] {
    return this.filteredItemsByCourse.filter(item => isClosedTopic(item.topic));
  }

  get noDueDateItems(): ReviewItem[] {
    return this.filteredItemsByCourse.filter(item => isNoDueDateTopic(item.topic));
  }

  navigateToItem(item: ReviewItem): void {
    const courseId = item.topic.course?.id;
    if (!courseId) {
      console.error("Could not find course ID for the item.", item);
      return;
    }
    this.router.navigate(['/courses', courseId, item.topic.type, item.topic.id]);
  }
  
  refreshData(): void {
    this.loadInitialData();
  }
}
