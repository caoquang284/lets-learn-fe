import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { StudentResponseService } from '@shared/services/student-response.service';
import { AssignmentTopic } from '@shared/models/topic';
import { formatDateString } from '@shared/helper/date.helper';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { AssignmentTab } from '@modules/assignment/constants/assignment.constant';
import { GetAllAssignmentResponsesOfTopic } from '@modules/assignment/api/assignment-response.api';
import { StudentResponse } from '@shared/models/student-response';
import { Course } from '@shared/models/course';
import { CloudinaryFile } from '@shared/models/cloudinary-file';
import { AssignmentData } from '@shared/models/assignment';

@Component({
  selector: 'tab-assignment',
  standalone: false,
  templateUrl: './tab-assignment.component.html',
  styleUrl: './tab-assignment.component.scss',
  providers: [StudentResponseService],
})
export class TabAssignmentComponent implements OnInit, OnChanges {
  @Input({ required: true }) topic!: AssignmentTopic;
  @Input() course!: Course;

  studentResponses: StudentResponse[] = [];
  uploadedFiles: CloudinaryFile[] = [];

  constructor(private tabService: TabService<string>) {}

  ngOnInit(): void {
    this.fetchAssignmentResponses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topic'] && this.topic) {
      const assignmentData = this.topic.data as AssignmentData;
      this.uploadedFiles = assignmentData.cloudinaryFiles ?? [];
    }
  }

  get assignedCount(): number {
    return this.course && this.course.students
      ? this.course.students.length
      : 0;
  }

  get submittedCount(): number {
    return this.studentResponses.length;
  }

  get needGradingCount(): number {
    return this.studentResponses.filter((res) => {
      const data = res.data as any;
      return !data || data.mark === null || data.mark === undefined;
    }).length;
  }

  async fetchAssignmentResponses() {
    try {
      this.studentResponses = await GetAllAssignmentResponsesOfTopic(
        this.topic.id
      );
    } catch (error) {
      throw error;
    }
  }

  formatDate(date: string | null, pattern: string = 'MM/dd/yyyy HH:mm a') {
    return formatDateString(date, pattern);
  }

  onGradeBtnClick() {
    this.tabService.selectTab(AssignmentTab.SUBMISSIONS);
  }
}
