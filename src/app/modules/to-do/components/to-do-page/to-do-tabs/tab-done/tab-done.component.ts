import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToDoService } from '../../to-do.service';
import { ToDoItem } from '../../../../constants/to-do.constants';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isDoneTopic } from '../../../../helper/to-do.util';

@Component({
  selector: 'tab-done',
  standalone: false,
  templateUrl: './tab-done.component.html',
  styleUrl: './tab-done.component.scss',
  providers: [CollapsibleListService]
})
export class TabDoneComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: ToDoItem[] = [];
  
  doneItems: ToDoItem[] = [];
  
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    public collapsibleListService: CollapsibleListService
  ) {}

  ngOnInit() {
    this.initializeCollapsibleSections();
    this.updateDoneItems();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges() {
    this.updateDoneItems();
  }

  private initializeCollapsibleSections() {
    const sectionIds = ['no-due-date', 'complete-early', 'this-week', 'last-week', 'sooner'];
    this.collapsibleListService.setSectionIds(sectionIds);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.expandAll();
  }

  private updateDoneItems() {
    this.doneItems = this.items.filter(item => isDoneTopic(item.topic));
  }

  private categorizeDoneItems(items: ToDoItem[]) {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
    return {
      noDueDate: items.filter(item => !item.dueDate),
      completeEarly: items.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate > now;
      }),
      thisWeek: items.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate >= startOfThisWeek && dueDate <= endOfThisWeek;
      }),
      lastWeek: items.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate >= startOfLastWeek && dueDate <= endOfLastWeek;
      }),
      sooner: items.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate < startOfLastWeek;
      }),
    };
  }

  getSectionItems(sectionId: string): ToDoItem[] {
    const categorized = this.categorizeDoneItems(this.doneItems);
    switch (sectionId) {
      case 'no-due-date':
        return categorized.noDueDate;
      case 'complete-early':
        return categorized.completeEarly;
      case 'this-week':
        return categorized.thisWeek;
      case 'last-week':
        return categorized.lastWeek;
      case 'sooner':
        return categorized.sooner;
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
