import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  GetPublicCourses,
  GetTeacherCourses,
  JoinCourse,
} from '@modules/courses/api/courses.api';
import { mockCourses } from '@shared/mocks/course';
import { Course } from '@shared/models/course';
import { Role, User } from '@shared/models/user';
import { UserService } from '@shared/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  isStudent = true;

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.userService.user$.subscribe((user) => {
      if (user) {
        this.isStudent = user.role === Role.STUDENT;
      } else {
        this.isStudent = true;
      }
    });
  }

  ngOnInit(): void {
    this.updateCourses();
  }

  async updateCourses() {
    const user = this.userService.getUser();
    if (!user) return;
    let res: Course[] = [];
    if (user.role === Role.TEACHER) res = await GetTeacherCourses(user.id);
    else res = await GetPublicCourses();
    this.courses = res;
  }

  async onSubmitCode(code: string) {
    await JoinCourse(code)
      .then(() => {
        this.router.navigate([`/courses/${code}`]);
        this.toastr.success('You have successfully joined the course!');
      })
      .catch((error) => {
        this.toastr.error(error.message);
      });
  }
}
