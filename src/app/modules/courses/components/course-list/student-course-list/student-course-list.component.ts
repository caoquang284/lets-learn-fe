import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LayoutService } from '@shared/components/layout/layout.service';
import { Course } from '@shared/models/course';
import { wrapGrid } from 'animate-css-grid';

@Component({
  selector: 'student-course-list',
  standalone: false,
  templateUrl: './student-course-list.component.html',
  styleUrl: './student-course-list.component.scss',
})
export class StudentCourseListComponent {
  @Input() courses: Course[] = [];
  @Output() submitCode = new EventEmitter<string>();
  constructor(
    private responsive: BreakpointObserver,
    private layoutService: LayoutService
  ) {}
  isSidebarCollapsed = false;
  screenSize: 'default' | 'medium' | 'small' | 'xsmall' = 'default';

  // XSmall (max-width: 599.98px)
  // Small (min-width: 600px) and (max-width: 959.98px)
  // Medium (min-width: 960px) and (max-width: 1279.98px)
  // Large (min-width: 1280px) and (max-width: 1919.98px)
  // XLarge (min-width: 1920px)

  ngOnInit(): void {
    const grid = document.querySelector('.course-list') as HTMLElement;
    wrapGrid(grid);
    this.responsive
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .subscribe((state) => {
        if (state.breakpoints[Breakpoints.XSmall]) {
          this.screenSize = 'xsmall';
        } else if (state.breakpoints[Breakpoints.Small]) {
          this.screenSize = 'small';
        } else if (state.breakpoints[Breakpoints.Medium])
          this.screenSize = 'medium';
        else {
          this.screenSize = 'default';
        }
      });
    this.layoutService.isCollapsed$.subscribe((value) => {
      this.isSidebarCollapsed = value;
    });
  }

  onSubmitCode(code: string) {
    this.submitCode.emit(code);
  }
}
