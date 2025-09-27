import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  PAGE_STUDENT_TABS,
  PAGE_TEACHER_TABS,
  PageTab,
} from '@modules/page/constants/page.constant';
import { GetCourseById } from '@modules/courses/api/courses.api';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { mockCourses } from '@shared/mocks/course';
import { mockTopics } from '@shared/mocks/topic';
import { Course } from '@shared/models/course';
import { PageTopic } from '@shared/models/topic';
import { Role, User } from '@shared/models/user';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { UserService } from '@shared/services/user.service';
import { GetTopic } from '@modules/courses/api/topic.api';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'page-page',
  standalone: false,
  templateUrl: './page-page.component.html',
  styleUrl: './page-page.component.scss',
  providers: [TabService],
})
export class PagePageComponent implements OnInit {
  course: Course | null = null;
  topic: PageTopic = mockTopics[5] as PageTopic;
  tabs = PageTab;
  user: User | null = null;
  isStudent = true;
  selectedTab = PageTab.PAGE;

  constructor(
    private tabService: TabService<PageTab>,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private activedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.InitData();
    this.tabService.setTabs(PAGE_STUDENT_TABS);
    this.tabService.selectedTab$.subscribe((tab) => {
      if (tab) {
        this.selectedTab = tab;
        this.cdr.detectChanges();
      }
    });
    this.userService.user$.subscribe((user) => {
      this.user = user;
      if (user?.role === Role.TEACHER) {
        this.tabService.setTabs(PAGE_TEACHER_TABS);
        this.isStudent = false;
      } else {
        this.tabService.setTabs(PAGE_STUDENT_TABS);
        this.isStudent = true;
      }
    });
  }

  InitData() {
    const topicId = this.activedRoute.snapshot.paramMap.get('topicId');
    const courseId = this.activedRoute.snapshot.paramMap.get('courseId');
    if (courseId) this.fetchCourseData(courseId);
    if (topicId && courseId) this.fetchTopicData(topicId, courseId);
    if (this.course && this.topic) {
      this.updateBreadcrumb(this.course, this.topic);
    }
  }

  async fetchTopicData(topicId: string, courseId: string) {
    try {
      const topic = await GetTopic(topicId, courseId);
      if (topic) {
        this.topic = topic as PageTopic;
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
      }
    } catch (error) {
      this.toastr.error('Failed to fetch course', 'Error');
    }
  }

  updateBreadcrumb(course: Course, topic: PageTopic) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: course.title,
        url: `/courses/${course.id}`,
        active: false,
      },
      {
        label: topic.title,
        url: `/courses/${course.id}/page/${topic.id}`,
        active: true,
      },
    ]);
  }
}
