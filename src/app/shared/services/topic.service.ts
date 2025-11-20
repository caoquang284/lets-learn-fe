import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Topic,
  TopicType,
  TopicTypeOption,
  getTopicTypeOptions,
} from '@shared/models/topic';
import { AssignmentData, FileSizeOption } from '@shared/models/assignment';
import { QuizData, TimeLimitType, GradingMethod } from '@shared/models/quiz';
import { LinkData } from '@shared/models/link';
import { PageData } from '@shared/models/page';
import { FileTopicData } from '@shared/models/file-topic';
import { MeetingData } from '@shared/models/meeting';
import { generateId } from '@shared/helper/string.helper';
import {
  getEndDateOfWeek,
  getStartDateOfWeek,
} from '@shared/helper/date.helper';

export interface CreateTopicRequest {
  sectionId: string;
  type: TopicType;
  title?: string;
  data?: any;
}

export interface CreateTopicResponse {
  topic: Topic;
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  constructor() {}

  getTopicTypeOptions(): TopicTypeOption[] {
    return getTopicTypeOptions();
  }

  updateTopic(
    topicId: string,
    updates: Partial<Topic>
  ): Observable<CreateTopicResponse> {
    return of({
      topic: { ...updates } as Topic,
      success: true,
      message: 'Topic updated successfully',
    });
  }

  deleteTopic(
    topicId: string
  ): Observable<{ success: boolean; message: string }> {
    return of({
      success: true,
      message: 'Topic deleted successfully',
    });
  }

  getTopicsBySection(sectionId: string): Observable<Topic[]> {
    return of([]);
  }

  getNewTopic(request: CreateTopicRequest): Topic {
    const { sectionId, type, title } = request;
    let topicData: any;

    switch (type) {
      case TopicType.ASSIGNMENT:
        topicData = {
          description:
            'Complete tasks or projects and submit your work for grading. ',
          open: getStartDateOfWeek(new Date()).toISOString(),
          close: getEndDateOfWeek(new Date()).toISOString(),
          remindToGrade: null,
          maximumFile: 1,
          maximumFileSize: FileSizeOption['5MB'],
        } as AssignmentData;
        break;

      case TopicType.QUIZ:
        topicData = {
          description:
            'Test your knowledge with multiple-choice or short-answer questions.',
          open: getStartDateOfWeek(new Date()).toISOString(),
          close: getEndDateOfWeek(new Date()).toISOString(),
          timeLimit: null,
          timeLimitUnit: TimeLimitType.MINUTES,
          gradeToPass: 0,
          gradingMethod: GradingMethod.LAST_GRADE,
          attemptAllowed: 'Unlimited',
          questions: [],
        } as QuizData;
        break;

      case TopicType.LINK:
        topicData = {
          url: null,
          description:
            'Access external websites or resources related to the course.',
        } as LinkData;
        break;

      case TopicType.PAGE:
        topicData = {
          description:
            'Read course content or instructions right on this website.',
          content: '',
        } as PageData;
        break;

      case TopicType.FILE:
        topicData = {
          file: null,
          description:
            'Download documents like PDFs, slides, or readings shared by your teacher.',
        } as FileTopicData;
        break;
      case TopicType.MEETING:
        topicData = {
          description: 'Join online meetings and participate in class discussions.',
          open: getStartDateOfWeek(new Date()).toISOString(),
          close: getEndDateOfWeek(new Date()).toISOString(),
        } as MeetingData;
        break;

      default:
        topicData = {
          description: '',
        };
        break;
    }

    return {
      id: generateId(4),
      title: title || `New ${type}`,
      sectionId: sectionId,
      type: type,
      data: topicData,
    } as Topic;
  }
}
