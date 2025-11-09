import { Component, Input, OnInit } from '@angular/core';
import {
  AssignmentResponseData,
  StudentResponse,
} from '@shared/models/student-response';
import { AssignmentTopic } from '@shared/models/topic';
import { Course } from '@shared/models/course';
import { GetAllAssignmentResponsesOfTopic, UpdateAssignmentResponse } from '@modules/assignment/api/assignment-response.api';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'tab-submission',
  standalone: false,
  templateUrl: './tab-submission.component.html',
  styleUrl: './tab-submission.component.scss',
})
export class TabSubmissionComponent implements OnInit {
  @Input({ required: true }) topic!: AssignmentTopic;
  @Input() course!: Course;
  studentResponses: StudentResponse[] = [];
  filteredStudentResponses: StudentResponse[] = [];

  selectedStudentResponse: StudentResponse | null = null;

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.fetchAssignmentResponses();
  }

  get assignedCount(): number {
    return this.course && this.course.students ? this.course.students.length : 0;
  }

  get submittedCount(): number {
    return this.studentResponses.length;
  }

  async fetchAssignmentResponses() {
    try {
      this.studentResponses = await GetAllAssignmentResponsesOfTopic(this.topic.id);
      this.filteredStudentResponses = this.studentResponses;
    } catch (error) {
      this.toastr.error('Failed to fetch assignment responses', 'Error');
    }
  }

  filteredStudents(searchTerm: string) {
    return this.studentResponses.filter((res) =>
      res.student.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  onSearchChange(searchTerm: string) {
    this.filteredStudentResponses = this.filteredStudents(searchTerm);
  }

  getStudents(responses: StudentResponse[]) {
    return responses.map((response) => response.student);
  }

  getMarkOfResponse(response: StudentResponse) {
    const data = response.data as AssignmentResponseData;
    return data.mark;
  }

  onResponseClick(response: StudentResponse) {
    console.log('Response clicked:', response);
    this.selectedStudentResponse = response;
  }

  onCloseSubmittedView() {
    this.selectedStudentResponse = null;
  }

  async onSaveMark(newMark: number) {
    if (!this.selectedStudentResponse) return;
    const updatedResponse = {
      ...this.selectedStudentResponse,
      data: {
        ...this.selectedStudentResponse.data,
        mark: newMark,
      },
    };
    try {
      await UpdateAssignmentResponse(this.topic.id, updatedResponse);
      this.selectedStudentResponse = updatedResponse;
      this.toastr.success('Mark updated successfully');
    } catch (error) {
      this.toastr.error('Failed to update mark');
    }
  }

  async onScoreInputEnter(event: any, res: StudentResponse) {
    const input = (event.target as HTMLInputElement);
    const newMark = Number(input.value);
    if (isNaN(newMark) || newMark < 0 || newMark > 100) {
      this.toastr.error('Invalid score');
      return;
    }
    const updatedResponse = {
      ...res,
      data: {
        ...res.data,
        mark: newMark,
      },
    };
    try {
      await UpdateAssignmentResponse(this.topic.id, updatedResponse);
      // Update the mark in the local list
      const idx = this.studentResponses.findIndex(r => r.id === res.id);
      if (idx !== -1) {
        this.studentResponses[idx] = updatedResponse;
        this.filteredStudentResponses[idx] = updatedResponse;
      }
      if (this.selectedStudentResponse?.id === res.id) {
        this.selectedStudentResponse = updatedResponse;
      }
      this.toastr.success('Mark updated successfully');
    } catch (error) {
      this.toastr.error('Failed to update mark');
    }
  }
}
