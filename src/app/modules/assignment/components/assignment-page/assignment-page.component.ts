import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ASSIGNMENT_STUDENT_TABS,
  ASSIGNMENT_TEACHER_TABS,
  AssignmentTab,
} from '@modules/assignment/constants/assignment.constant';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { mockCourses } from '@shared/mocks/course';
import { mockTopics } from '@shared/mocks/topic';
import { Course } from '@shared/models/course';
import { AssignmentTopic, iconMap } from '@shared/models/topic';
import { Role, User } from '@shared/models/user';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'assignment-page',
  standalone: false,
  templateUrl: './assignment-page.component.html',
  styleUrl: './assignment-page.component.scss',
  providers: [TabService],
})
export class AssignmentPageComponent implements OnInit {
  course: Course | null = null;
  topic: AssignmentTopic = mockTopics[1] as AssignmentTopic;
  tabs = AssignmentTab;
  user: User | null = null;
  isStudent = true;
  topicIcon = '';
  selectedTab = AssignmentTab.ASSIGNMENT;

  constructor(
    private tabService: TabService<AssignmentTab>,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private activedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    const topicId = this.activedRoute.snapshot.paramMap.get('topicId');
    const courseId = this.activedRoute.snapshot.paramMap.get('courseId');
    if (courseId) this.fetchCourseData(courseId);
    if (topicId) this.fetchTopicData(topicId);
    if (courseId && topicId && this.course && this.topic) {
      this.updateBreadcrumb(this.course, this.topic);
    }
  }

  ngOnInit(): void {
    this.topicIcon = iconMap[this.topic.type];
    this.tabService.setTabs(ASSIGNMENT_STUDENT_TABS);
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

  fetchTopicData(topicId: string) {
    const res = mockTopics.find((topic) => topic.id === topicId);
    if (res) this.topic = res as AssignmentTopic;
  }

  fetchCourseData(courseId: string) {
    const res = mockCourses.find((course) => course.id === courseId);
    if (res) this.course = res;
  }

  updateBreadcrumb(course: Course, topic: AssignmentTopic) {
    if (!course || !topic) return;
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
}