export enum MeetingTab {
  MEETING = 'Meeting',
  SETTINGS = 'Settings',
}

export const MEETING_TEACHER_TABS = Object.values(MeetingTab);
export const MEETING_STUDENT_TABS = [MeetingTab.MEETING];