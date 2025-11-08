import { Component, Input, OnInit } from '@angular/core';
import { CollapsibleListService } from '@shared/components/collapsible-list/collapsible-list.service';
import { Course } from '@shared/models/course';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'tab-course-student',
  standalone: false,
  templateUrl: './tab-course-student.component.html',
  styleUrl: './tab-course-student.component.scss',
  providers: [CollapsibleListService],
})
export class TabCourseStudentComponent implements OnInit {
  @Input({ required: true }) course!: Course;
  edittingSectionIds: string[] = [];

  constructor(
    private collapsibleListService: CollapsibleListService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const ids = this.course.sections.map((s) => s.id);
    this.collapsibleListService.setCanEdit(false);
    this.collapsibleListService.setSectionIds(ids);
    this.collapsibleListService.editingSectionIds$.subscribe((ids) => {
      this.edittingSectionIds = ids;
    });
  }

  onCopyCourseId() {
    navigator.clipboard.writeText(this.course.id).then(() => {
      this.toastr.success('Copied to clipboard');
    });
  }
}
