import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FILE_STUDENT_TABS,
  FILE_TEACHER_TABS,
  FileTab,
} from '@modules/file/constants/file.constant';
import { TabService } from '@shared/components/tab-list/tab-list.service';
import { Course } from '@shared/models/course';
import { FileTopic, iconMap } from '@shared/models/topic';
import { Role, User } from '@shared/models/user';
import { BreadcrumbService } from '@shared/services/breadcrumb.service';
import { UserService } from '@shared/services/user.service';
import { GetTopic } from '@modules/courses/api/topic.api';
import { GetCourseById } from '@modules/courses/api/courses.api';

@Component({
  selector: 'app-file-page',
  standalone: false,
  templateUrl: './file-page.component.html',
  styleUrls: ['./file-page.component.scss'],
  providers: [TabService],
})
export class FilePageComponent implements OnInit {
  course: Course | null = null;
  topic: FileTopic | null = null;
  tabs = FileTab;
  user: User | null = null;
  isStudent = true;
  topicIcon = '';
  selectedTab = FileTab.FILE;
  courseId: string | null = null;
  topicId: string | null = null;

  constructor(
    private tabService: TabService<FileTab>,
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
    this.tabService.setTabs(FILE_STUDENT_TABS);
    this.tabService.selectedTab$.subscribe((tab) => {
      if (tab) {
        this.selectedTab = tab;
        this.cdr.detectChanges();
      }
    });

    this.userService.user$.subscribe((user) => {
      this.user = user;
      if (user?.role === Role.TEACHER) {
        this.tabService.setTabs(FILE_TEACHER_TABS);
        this.isStudent = false;
      } else {
        this.tabService.setTabs(FILE_STUDENT_TABS);
        this.isStudent = true;
      }
    });
  }

  async fetchTopicData(topicId: string, courseId: string) {
    try {
      this.topic = await GetTopic(topicId, courseId) as FileTopic;
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

  updateBreadcrumb(course: Course, topic: FileTopic) {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: course.title,
        url: `/courses/${course.id}`,
        active: false,
      },
      {
        label: topic.title,
        url: `/courses/${course.id}/file/${topic.id}`,
        active: true,
      },
    ]);
  }
}
