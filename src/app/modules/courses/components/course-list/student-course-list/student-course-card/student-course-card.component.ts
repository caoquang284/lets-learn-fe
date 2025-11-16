import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { JoinCourse } from '@modules/courses/api/courses.api';
import { Course } from '@shared/models/course';
import { User } from '@shared/models/user';
import { UserService } from '@shared/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'student-course-card',
  standalone: false,
  templateUrl: './student-course-card.component.html',
  styleUrl: './student-course-card.component.scss',
})
export class StudentCourseCardComponent {
  @Input({ required: true }) course!: Course;
  currentUser: User | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.userService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  get hasJoined(): boolean {
    if (!this.currentUser) return false;
    const enrollments = this.currentUser.enrollments;
    if (!Array.isArray(enrollments)) return false;
    return enrollments.some((e: any) => String(e?.courseId) === this.course.id);
  }

  handleClick() {
    if (this.hasJoined) {
      this.router.navigate(['/courses', this.course.id]);
    }
  }

  async onJoinCourse() {
    await JoinCourse(this.course.id)
      .then(() => {
        this.onJoinCourseSuccess();
      })
      .catch((error) => {
        console.error('Error joining course:', error);
        this.toastr.error(error.message);
      });
  }

  onJoinCourseSuccess() {
    if (!this.currentUser) return;
    const currentEnrollments = Array.isArray(this.currentUser.enrollments)
      ? this.currentUser.enrollments
      : [];
    const updatedEnrollments = [
      ...currentEnrollments,
      { courseId: this.course.id },
    ];
    this.userService.updateUser({ enrollments: updatedEnrollments });
    this.toastr.success('You have successfully joined the course!');
    this.router.navigate(['/courses', this.course.id]);
  }
}
