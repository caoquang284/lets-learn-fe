import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ASSIGNMENT_STUDENT_TABS,
  ASSIGNMENT_TEACHER_TABS,
  AssignmentTab,
} from '@modules/assignment/constants/assignment.constant';
import { GetCourseById } from '@modules/courses/api/courses.api';
import { GetTopic } from '@modules/courses/api/topic.api';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { mockTopics } from '@shared/mocks/topic';
import { Course } from '@shared/models/course';
import { AssignmentTopic } from '@shared/models/topic';
import { Role, User } from '@shared/models/user';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { UserService } from '@shared/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'assignment-page',
  standalone: false,
  templateUrl: './assignment-page.component.html',
  styleUrl: './assignment-page.component.scss',
  providers: [TabService],
})
export class AssignmentPageComponent implements OnInit {
  course: Course | null = null;
  topic: AssignmentTopic | null = null;
  tabs = AssignmentTab;
  user: User | null = null;
  isStudent = true;
  selectedTab = AssignmentTab.ASSIGNMENT;

  constructor(
    private tabService: TabService<AssignmentTab>,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private activedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.InitData();
    this.tabService.selectedTab$.subscribe((tab) => {
      if (tab) {
        this.selectedTab = tab;
        this.cdr.detectChanges();
      }
    });
    this.userService.user$.subscribe((user) => {
      this.user = user;
      if (user?.role === Role.TEACHER) {
        this.tabService.setTabs(ASSIGNMENT_TEACHER_TABS);
        this.isStudent = false;
      } else {
        this.tabService.setTabs(ASSIGNMENT_STUDENT_TABS);
        this.isStudent = true;
      }
    });
  }

  InitData() {
    const topicId = this.activedRoute.snapshot.paramMap.get('topicId');
    const courseId = this.activedRoute.snapshot.paramMap.get('courseId');
    if (courseId) this.fetchCourseData(courseId);
    if (topicId && courseId) this.fetchTopicData(topicId, courseId);
  }

  async fetchTopicData(topicId: string, courseId: string) {
    try {
      const topic = await GetTopic(topicId, courseId);
      if (topic) {
        this.topic = topic as AssignmentTopic;
        if (this.course) {
          this.updateBreadcrumb(this.course, this.topic);
        }
      }
    } catch (error) {
      this.toastr.error('Failed to fetch topic', 'Error');
    }
  }

  async fetchCourseData(courseId: string) {
    try {
      const course = await GetCourseById(courseId);
      if (course) {
        this.course = course;
        if (this.topic) {
          this.updateBreadcrumb(this.course, this.topic);
        }
      }
    } catch (error) {
      this.toastr.error('Failed to fetch course', 'Error');
    }
  }

  updateBreadcrumb(course: Course, topic: AssignmentTopic) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: course.title,
        url: `/courses/${course.id}`,
        active: false,
      },
      {
        label: topic.title,
        url: `/courses/${course.id}/assignment/${topic.id}`,
        active: true,
      },
    ]);
  }
  onTopicChange(topic: AssignmentTopic) {
    this.topic = topic;
    if (this.course) {
      this.updateBreadcrumb(this.course, this.topic);
    }
    this.cdr.detectChanges();
  }
}
