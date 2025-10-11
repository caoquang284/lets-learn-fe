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
import { mockTopics } from '@shared/mocks/topic';
import { mockCourses } from '@shared/mocks/course';
// import { GetTopic } from '@modules/courses/api/topic.api';
// import { GetCourseById } from '@modules/courses/api/courses.api';
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
  selectedTab = MeetingTab.MEETING;
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
    
    // Fetch mock data based on route params
    if (this.courseId) this.fetchCourseData(this.courseId);
    if (this.topicId) {
      this.fetchTopicData(this.topicId);
    } else {
      // If no topicId in route, create a mock topic
      this.createMockTopic();
    }
  }

  ngOnInit(): void {
    this.tabService.setTabs(MEETING_STUDENT_TABS);
    this.tabService.selectedTab$.subscribe((tab) => {
      if (tab) {
        this.selectedTab = tab;
        this.cdr.detectChanges();
      }
    });

    // Create mock teacher user for frontend preview
    const mockTeacherUser: User = {
      id: 'mock-teacher-id',
      username: 'mockteacher',
      email: 'teacher@example.com',
      password: 'mock-password',
      avatar: 'https://via.placeholder.com/150',
      role: Role.TEACHER,
      courses: []
    };
    
    // Set mock user to see both tabs
    this.userService.setUser(mockTeacherUser);

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

  fetchTopicData(topicId: string) {
    const res = mockTopics.find((topic) => topic.id === topicId);
    if (res && res.type === TopicType.MEETING) {
      this.topic = res as MeetingTopic;
    } else {
      // If no topic found with the given ID, create a mock topic
      this.createMockTopic();
    }
  }

  fetchCourseData(courseId: string) {
    const res = mockCourses.find((course) => course.id === courseId);
    if (res) this.course = res;
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

  createMockTopic() {
    // Create mock topic for frontend preview when API is not available
    this.topic = {
      id: this.topicId || 'mock-meeting-topic-id',
      sectionId: 'mock-section-id',
      title: 'Sample Meeting Topic',
      type: TopicType.MEETING,
      course: {
        id: this.courseId || 'mock-course-id',
        title: 'Sample Course'
      } as Course,
      data: {
          id: this.topicId || 'mock-meeting-data-id',
        topic: 'Sample Meeting Topic',
        description: 'Sample meeting description',
        meetingDate: new Date(),
        meetingUrl: 'https://zoom.us/j/sample-meeting',
        isActive: true,
        comments: []
      }
    };
  }
}