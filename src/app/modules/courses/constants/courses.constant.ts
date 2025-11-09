export enum CourseTab {
  COURSE = 'Course',
  ACTIVITIES = 'Activities',
  PEOPLE = 'People',
  DASHBOARD = 'Dashboard',
  SETTINGS = 'Settings',
}
export const COURSE_TEACHER_TABS = Object.values(CourseTab);
export const COURSE_STUDENT_TABS = [
  CourseTab.COURSE,
  CourseTab.ACTIVITIES,
  CourseTab.PEOPLE,
  CourseTab.DASHBOARD,
];
