import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  MEETING_STUDENT_TABS,
  MEETING_TEACHER_TABS,
  MeetingTab,
} from '@modules/meeting/constants/meeting.constant';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { Course } from '@shared/models/course';
import { MeetingTopic, TopicType } from '@shared/models/topic';
import { Role, User } from '@shared/models/user';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { UserService } from '@shared/services/user.service';
import { GetCourseById } from '@modules/courses/api/courses.api';
import { GetTopic } from '@modules/courses/api/topic.api';
@Component({
  selector: 'app-meeting-page',
  standalone: false,
  templateUrl: './meeting-page.component.html',
  styleUrls: ['./meeting-page.component.scss'],
  providers: [TabService],
})
export class MeetingPageComponent implements OnInit {
  course: Course | null = null;
  topic: MeetingTopic | null = null;
  tabs = MeetingTab;
  user: User | null = null;
  isStudent = true;
  selectedTab = MeetingTab.DETAIL;
  courseId: string | null = null;
  topicId: string | null = null;

  constructor(
    private tabService: TabService<MeetingTab>,
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
    this.tabService.setTabs(MEETING_STUDENT_TABS);
    this.tabService.selectedTab$.subscribe((tab) => {
      if (tab) {
        this.selectedTab = tab;
        this.cdr.detectChanges();
      }
    });

    this.userService.user$.subscribe((user) => {
      this.user = user;
      if (user?.role === Role.TEACHER) {
        this.tabService.setTabs(MEETING_TEACHER_TABS);
        this.isStudent = false;
      } else {
        this.tabService.setTabs(MEETING_STUDENT_TABS);
        this.isStudent = true;
      }
    });
  }

  async fetchTopicData(topicId: string, courseId: string) {
      try {
        this.topic = await GetTopic(topicId, courseId) as MeetingTopic;
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

  updateBreadcrumb(course: Course, topic: MeetingTopic) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: course.title,
        url: `/courses/${course.id}`,
        active: false,
      },
      {
        label: topic.title,
        url: `/courses/${course.id}/meeting/${topic.id}`,
        active: true,
      },
    ]);
  }
}