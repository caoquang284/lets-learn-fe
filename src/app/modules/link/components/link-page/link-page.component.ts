import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  LINK_STUDENT_TABS,
  LINK_TEACHER_TABS,
  LinkTab,
} from '@modules/link/constants/link.constant';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { Course } from '@shared/models/course';
import { LinkTopic } from '@shared/models/topic';
import { Role, User } from '@shared/models/user';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { UserService } from '@shared/services/user.service';
import { GetTopic } from '@modules/courses/api/topic.api';
import { GetCourseById } from '@modules/courses/api/courses.api';
@Component({
  selector: 'app-link-page',
  standalone: false,
  templateUrl: './link-page.component.html',
  styleUrls: ['./link-page.component.scss'],
  providers: [TabService],
})
export class LinkPageComponent implements OnInit {
  course: Course | null = null;
  topic: LinkTopic | null = null;
  tabs = LinkTab;
  user: User | null = null;
  isStudent = true;
  selectedTab = LinkTab.LINK;
  courseId: string | null = null;
  topicId: string | null = null;

  constructor(
    private tabService: TabService<LinkTab>,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private activedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.topicId = this.activedRoute.snapshot.paramMap.get('topicId');
    this.courseId = this.activedRoute.snapshot.paramMap.get('courseId');
    
    if (this.courseId) this.fetchCourseData(this.courseId);
    if (this.topicId && this.courseId) this.fetchTopicData(this.topicId, this.courseId);
  }
  ngOnInit(): void {
    this.tabService.setTabs(LINK_STUDENT_TABS);
    this.tabService.selectedTab$.subscribe((tab) => {
      if (tab) {
        this.selectedTab = tab;
        this.cdr.detectChanges();
      }
    });

    this.userService.user$.subscribe((user) => {
      this.user = user;
      if (user?.role === Role.TEACHER) {
        this.tabService.setTabs(LINK_TEACHER_TABS);
        this.isStudent = false;
      } else {
        this.tabService.setTabs(LINK_STUDENT_TABS);
        this.isStudent = true;
      }
    });
  }

  async fetchTopicData(topicId: string, courseId: string) {
    try {
      this.topic = await GetTopic(topicId, courseId) as LinkTopic;
      // Update breadcrumb after both course and topic are loaded
      if (this.course && this.topic) {
        this.updateBreadcrumb(this.course, this.topic);
      }
    } catch (error) {
      console.error('Error fetching topic data:', error);
      this.topic = null;
    }
  }

  async fetchCourseData(courseId: string) {
    try {
      this.course = await GetCourseById(courseId);
      // Update breadcrumb after both course and topic are loaded
      if (this.course && this.topic) {
        this.updateBreadcrumb(this.course, this.topic);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      this.course = null;
    }
  }

  updateBreadcrumb(course: Course, topic: LinkTopic) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: course.title,
        url: `/courses/${course.id}`,
        active: false,
      },
      {
        label: topic.title,
        url: `/courses/${course.id}/link/${topic.id}`,
        active: true,
      },
    ]);
  }
}
