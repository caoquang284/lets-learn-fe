import { Component, Input, OnInit } from '@angular/core';
import { AssignmentTopic } from '@shared/models/topic';
import { GetAllAssignmentResponsesOfTopic } from '@modules/assignment/api/assignment-response.api';
import { StudentResponse } from '@shared/models/student-response';
import { User } from '@shared/models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'tab-dashboard',
  standalone: false,
  templateUrl: './tab-dashboard.component.html',
  styleUrl: './tab-dashboard.component.scss',
})
export class TabDashboardComponent implements OnInit {
  @Input({ required: true }) topic!: AssignmentTopic;
  @Input({ required: true }) students: User[] = [];

  studentResponses: StudentResponse[] = [];

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.fetchAssignmentResponses();
  }

  async fetchAssignmentResponses() {
    try {
      this.studentResponses = await GetAllAssignmentResponsesOfTopic(this.topic.id);
    } catch (error) {
      this.toastr.error('Failed to fetch assignment responses', 'Error');
    }
  }
}
