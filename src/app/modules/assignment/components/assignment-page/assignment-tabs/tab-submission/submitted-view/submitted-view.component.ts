import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SubmissionStatus } from '@modules/assignment/constants/assignment.constant';
import {
  compareTime,
  formatDateString,
  getDurationText,
} from '@shared/helper/date.helper';
import {
  AssignmentResponseData,
  StudentResponse,
} from '@shared/models/student-response';
import { AssignmentTopic } from '@shared/models/topic';
import { format } from 'date-fns';
import { UpdateAssignmentResponse } from '@modules/assignment/api/assignment-response.api';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'submitted-view',
  standalone: false,
  templateUrl: './submitted-view.component.html',
  styleUrl: './submitted-view.component.scss',
})
export class SubmittedViewComponent implements OnInit, OnChanges {
  @Input({ required: true }) topic!: AssignmentTopic;
  @Input({ required: true }) studentResponse!: StudentResponse;

  submittedTime: string = '';
  submissionStatus: SubmissionStatus = SubmissionStatus.NOT_SUBMITTED;
  submissionStatusText: string = '';
  submissionStatusType = SubmissionStatus;

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.initValues(this.topic, this.studentResponse);
  }

  ngOnChanges(): void {
    this.initValues(this.topic, this.studentResponse);
  }

  initValues(topic: AssignmentTopic, studentResponse: StudentResponse) {
    const { close } = topic.data;
    const responseData = studentResponse.data as AssignmentResponseData;
    const submittedAt = responseData.submittedAt;

    if (submittedAt) {
      const submittedDate = new Date(submittedAt);
      this.submittedTime = format(submittedDate, 'EEEE, dd MMMM yyyy, h:mm a');

      if (!close) {
        this.submissionStatusText = 'Submitted on time';
        this.submissionStatus = SubmissionStatus.SUBMITTED_EARLY;
      } else {
        const closeDate = new Date(close);
        const diff = compareTime(submittedDate, closeDate);
        this.submissionStatusText = getDurationText(
          submittedDate,
          closeDate,
          1
        );

        if (diff > 0) {
          this.submissionStatusText += ' late';
          this.submissionStatus = SubmissionStatus.SUBMITTED_LATE;
        } else {
          this.submissionStatusText += ' early';
          this.submissionStatus = SubmissionStatus.SUBMITTED_EARLY;
        }
      }
    }
  }

  formatDate(date: string | null, pattern: string = 'MM/dd/yyyy HH:mm a') {
    return formatDateString(date, pattern);
  }

  getNoteOfResponse() {
    const data = this.studentResponse.data as AssignmentResponseData;
    return data.note;
  }

  async onSaveNote(note: string) {
    const updatedResponse = {
      ...this.studentResponse,
      data: {
        ...this.studentResponse.data,
        note,
      },
    };
    try {
      await UpdateAssignmentResponse(this.topic.id, updatedResponse);
      this.toastr.success('Note updated successfully');
    } catch (error) {
      this.toastr.error('Failed to update note');
    }
  }
}
