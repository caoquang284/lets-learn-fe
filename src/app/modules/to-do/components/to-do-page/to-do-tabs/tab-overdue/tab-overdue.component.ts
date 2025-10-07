import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToDoItem, OverdueItemsByTime } from '../../../../constants/to-do.constants';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isOverdueTopic } from '../../../../helper/to-do.util';

@Component({
  selector: 'tab-overdue',
  standalone: false,
  templateUrl: './tab-overdue.component.html',
  styleUrl: './tab-overdue.component.scss',
  providers: [CollapsibleListService]
})
export class TabOverdueComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: ToDoItem[] = [];
  
  itemsByTime: OverdueItemsByTime = { 
    thisWeek: [], 
    lastWeek: [], 
    sooner: [] 
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
    const sectionIds = ['this-week', 'last-week', 'sooner'];
    this.collapsibleListService.setSectionIds(sectionIds);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.expandAll();
  }

  private sortItemsByDueDate(items: ToDoItem[]): ToDoItem[] {
    return items.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }
  
  private categorizeOverdueItems(items: ToDoItem[]): OverdueItemsByTime {
    const overdueItems = items.filter(item => isOverdueTopic(item.topic));
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    return {
      thisWeek: this.sortItemsByDueDate(overdueItems.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate >= startOfThisWeek && dueDate <= now; // Overdue this week
      })),
      lastWeek: this.sortItemsByDueDate(overdueItems.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        const endOfLastWeek = new Date(startOfThisWeek);
        endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
        return dueDate >= startOfLastWeek && dueDate <= endOfLastWeek;
      })),
      sooner: this.sortItemsByDueDate(overdueItems.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate < startOfLastWeek;
      }))
    };
  }

  private updateCategorizedItems() {
    this.itemsByTime = this.categorizeOverdueItems(this.items);
  }

  getSectionItems(sectionId: string): ToDoItem[] {
    switch (sectionId) {
      case 'this-week':
        return this.itemsByTime.thisWeek;
      case 'last-week':
        return this.itemsByTime.lastWeek;
      case 'sooner':
        return this.itemsByTime.sooner;
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
    return item.courseId || '1';
  }
}
