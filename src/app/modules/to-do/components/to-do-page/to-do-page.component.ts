import { Component, OnInit, signal } from '@angular/core';
import { ComboboxOption } from '@shared/components/combobox/combobox.type';
import { ComboboxService } from '@shared/components/combobox/combobox.service';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { ToDoService } from './to-do.service';
import { ToDoItem } from '../../constants/to-do.constants';
import { Topic } from '@shared/models/topic';
import { isDoneTopic, isOverdueTopic, isWorkingInProgressTopic, isNoDueDateTopic } from '../../helper/to-do.util';

@Component({
  selector: 'to-do-page',
  templateUrl: './to-do-page.component.html',
  styleUrls: ['./to-do-page.component.scss'],
  standalone: false,
  providers: [ComboboxService, TabService],
})
export class ToDoPageComponent implements OnInit {
  tabs: string[] = ['Assigned', 'Overdue', 'Done'];
  selectedTab: string = 'Assigned';
  
  courseOptions = signal<ComboboxOption[]>([
    { value: 'all', label: 'All courses' }
  ]);
  
  selectedCourseId = signal<string>('all');
  allItems: ToDoItem[] = [];
  isLoading = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private comboboxService: ComboboxService,
    private tabService: TabService<string>,
    private toDoService: ToDoService,
  ) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: 'To Do',
        url: '/to-do',
        active: true,
      },
    ]);
  }

  async ngOnInit(): Promise<void> {
    // Set up tabs
    this.tabService.setTabs(this.tabs);
    this.tabService.selectTab(this.tabs[0]);
    
    // Subscribe to tab changes
    this.tabService.selectedTab$.subscribe((tab) => {
      if (tab) {
        this.selectedTab = tab;
      }
    });
    
    // Load initial data
    await this.loadInitialData();
  }

  async onSelectOption(option: ComboboxOption): Promise<void> {
    this.selectedCourseId.set(option.value);
    this.updateCourseOptionsFromItems(this.allItems);
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      const toDoItems = await this.toDoService.getToDoItems();
      this.allItems = toDoItems;
      this.updateCourseOptionsFromItems(this.allItems);
    } catch (error) {
      this.allItems = [];
      this.updateCourseOptionsFromItems([]);
    } finally {
      this.isLoading = false;
    }
  }

  private updateCourseOptionsFromItems(items: ToDoItem[]): void {
    const courseOptions: ComboboxOption[] = [
      { value: 'all', label: 'All courses' },
    ];
    
    const checkIds: string[] = [];
    items.forEach((item) => {
      const course = item.topic.course;
      if (course && !checkIds.includes(course.id)) {
        courseOptions.push({ 
          value: course.id, 
          label: course.title 
        });
        checkIds.push(course.id);
      }
    });
    
    this.courseOptions.set(courseOptions);
  }

  get doneItems(): ToDoItem[] {
    return this.filteredItemsByCourse.filter(item => isDoneTopic(item.topic));
  }

  get assignedItems(): ToDoItem[] {
    return this.filteredItemsByCourse.filter(item => isWorkingInProgressTopic(item.topic));
  }

  get overdueItems(): ToDoItem[] {
    return this.filteredItemsByCourse.filter(item => isOverdueTopic(item.topic));
  }

  get noDueDateItems(): ToDoItem[] {
    return this.filteredItemsByCourse.filter(item => isNoDueDateTopic(item.topic));
  }

  get filteredItemsByCourse(): ToDoItem[] {
    const courseId = this.selectedCourseId();
    if (courseId === 'all') return this.allItems;
    return this.allItems.filter(item => item.courseId === courseId);
  }

  refreshData(): void {
    this.loadInitialData();
  }
}
