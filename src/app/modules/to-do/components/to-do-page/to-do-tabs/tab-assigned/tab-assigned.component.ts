import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToDoItem, ToDoItemsByDueDate } from '../../../../constants/to-do.constants';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { Subject } from 'rxjs';
import { isWorkingInProgressTopic, isNoDueDateTopic } from '../../../../helper/to-do.util';

@Component({
  selector: 'tab-assigned',
  standalone: false,
  templateUrl: './tab-assigned.component.html',
  styleUrl: './tab-assigned.component.scss',
  providers: [CollapsibleListService]
})
export class TabAssignedComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: ToDoItem[] = [];
  
  itemsByDueDate: ToDoItemsByDueDate = { 
    noDueDate: [], 
    thisWeek: [], 
    nextWeek: [], 
    later: [] 
  };
  private destroy$ = new Subject<void>();
  
  constructor(
    private router: Router,
    public collapsibleListService: CollapsibleListService
  ) {}

  ngOnInit() {
    this.initializeCollapsibleSections();
    this.updateCategorizedItems();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges() {
    this.updateCategorizedItems();
  }

  private initializeCollapsibleSections() {
    const sectionIds = ['no-due-date', 'this-week', 'next-week', 'later'];
    this.collapsibleListService.setSectionIds(sectionIds);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.expandAll();
  }

  private categorizeByDueDate(items: ToDoItem[]): ToDoItemsByDueDate {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfThisWeek = new Date(startOfWeek);
    endOfThisWeek.setDate(startOfWeek.getDate() + 6);
    const endOfNextWeek = new Date(endOfThisWeek);
    endOfNextWeek.setDate(endOfThisWeek.getDate() + 7);

    const workingItems = items.filter(item => isWorkingInProgressTopic(item.topic));

    return {
      noDueDate: items.filter(item => isNoDueDateTopic(item.topic)),
      thisWeek: workingItems.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate >= now && dueDate <= endOfThisWeek;
      }),
      nextWeek: workingItems.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate > endOfThisWeek && dueDate <= endOfNextWeek;
      }),
      later: workingItems.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate > endOfNextWeek;
      })
    };
  }

  private updateCategorizedItems() {
    this.itemsByDueDate = this.categorizeByDueDate(this.items);
  }

  getSectionItems(sectionId: string): ToDoItem[] {
    switch (sectionId) {
      case 'no-due-date':
        return this.itemsByDueDate.noDueDate;
      case 'this-week':
        return this.itemsByDueDate.thisWeek;
      case 'next-week':
        return this.itemsByDueDate.nextWeek;
      case 'later':
        return this.itemsByDueDate.later;
      default:
        return [];
    }
  }


  getSectionCount(sectionId: string): number {
    return this.getSectionItems(sectionId).length;
  }

  navigateToItem(item: ToDoItem): void {
    if (item.type === 'assignment') {
      this.router.navigate(['/courses', this.getCourseIdFromItem(item), 'assignment', item.id]);
    } else if (item.type === 'quiz') {
      this.router.navigate(['/courses', this.getCourseIdFromItem(item), 'quiz', item.id]);
    }
  }

  private getCourseIdFromItem(item: ToDoItem): string {
    return item.courseId || '1';
  }
}
