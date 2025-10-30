import { AssignmentData } from './assignment';
import { Course } from './course';
import { FileTopicData } from './file-topic';
import { MeetingData } from './meeting';
import { QuizData } from './quiz';
import { StudentResponse } from './student-response';
import { LinkData } from './link';
import { PageData } from './page';

interface BaseTopic {
  id: string;
  sectionId: string;
  title: string;
  type: TopicType;
  course?: Course;
}

export enum TopicType {
  ASSIGNMENT = 'assignment',
  FILE = 'file',
  LINK = 'link',
  MEETING = 'meeting',
  PAGE = 'page',
  QUIZ = 'quiz',
}

export interface QuizTopic extends BaseTopic {
  type: TopicType.QUIZ;
  data: QuizData;
  response?: StudentResponse[];
}
export interface AssignmentTopic extends BaseTopic {
  type: TopicType.ASSIGNMENT;
  data: AssignmentData;
  studentCount?: number;
  response?: StudentResponse;
}
export interface MeetingTopic extends BaseTopic {
  type: TopicType.MEETING;
  data: MeetingData;
}
export interface LinkTopic extends BaseTopic {
  type: TopicType.LINK;
  data: LinkData;
}

export interface FileTopic extends BaseTopic {
  type: TopicType.FILE;
  data: FileTopicData;
}
export interface PageTopic extends BaseTopic {
  type: TopicType.PAGE;
  data: PageData;
}

export type Topic =
  | LinkTopic
  | MeetingTopic
  | AssignmentTopic
  | FileTopic
  | QuizTopic
  | PageTopic;

export type TopicMap = {
  [TopicType.LINK]: any;
  [TopicType.MEETING]: any;
  [TopicType.ASSIGNMENT]: any;
  [TopicType.FILE]: any;
  [TopicType.QUIZ]: any;
  [TopicType.PAGE]: any;
};

//store keyword for each topic type to use google icon
export const iconMap: TopicMap = {
  link: 'share',
  meeting: 'videocam',
  assignment: 'upload_file',
  file: 'docs',
  quiz: 'checklist',
  page: 'article',
};

export const activityTopics: TopicType[] = [
  TopicType.ASSIGNMENT,
  TopicType.MEETING,
  TopicType.QUIZ,
];

export const resourceTopics = [TopicType.FILE, TopicType.LINK, TopicType.PAGE];

export const isValidType = (type: string): boolean => {
  return type in iconMap;
};

export interface TopicTypeOption {
  type: TopicType;
  label: string;
  icon: string;
  description: string;
}

export const getTopicTypeOptions = (): TopicTypeOption[] => [
  {
    type: TopicType.ASSIGNMENT,
    label: 'Assignment',
    icon: iconMap.assignment,
    description: 'Create assignments for students to submit',
  },
  {
    type: TopicType.QUIZ,
    label: 'Quiz',
    icon: iconMap.quiz,
    description: 'Create quizzes with multiple question types',
  },
  {
    type: TopicType.MEETING,
    label: 'Meeting',
    icon: iconMap.meeting,
    description: 'Schedule virtual meetings and conferences',
  },
  {
    type: TopicType.LINK,
    label: 'Link',
    icon: iconMap.link,
    description: 'Share external links and resources',
  },
  {
    type: TopicType.FILE,
    label: 'File',
    icon: iconMap.file,
    description: 'Upload and share files with students',
  },
  {
    type: TopicType.PAGE,
    label: 'Page',
    icon: iconMap.page,
    description: 'Create informational pages and content',
  },
];

export const getActivityTopicOptions = (): TopicTypeOption[] =>
  getTopicTypeOptions().filter((option) =>
    activityTopics.includes(option.type)
  );

export const getResourceTopicOptions = (): TopicTypeOption[] =>
  getTopicTypeOptions().filter((option) =>
    resourceTopics.includes(option.type)
  );
