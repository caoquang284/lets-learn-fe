export enum MeetingTab {
  DETAIL = 'Detail',
  SETTINGS = 'Settings',
}

// Backward compatibility (if any external code still references MEETING)
export const LEGACY_MEETING_TAB = MeetingTab.DETAIL;

export const MEETING_TEACHER_TABS = Object.values(MeetingTab);
export const MEETING_STUDENT_TABS = [MeetingTab.DETAIL];