import { Component, Input, OnInit } from '@angular/core';
import { Course } from '@shared/models/course';
import { User } from '@shared/models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'tab-people',
  standalone: false,
  templateUrl: './tab-people.component.html',
  styleUrl: './tab-people.component.scss',
})
export class TabPeopleComponent implements OnInit {
  @Input({ required: true }) course!: Course;
  @Input() canEdit = true;

  get instructor(): User | null {
    return this.course?.creator ?? null;
  }

  get members(): User[] {
    return this.course?.students ?? [];
  }

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {}
}
