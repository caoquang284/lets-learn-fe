import { Injectable } from '@angular/core';
import { isInDate } from '@shared/helper/date.helper';
import {
  AssignmentTopic,
  MeetingTopic,
  QuizTopic,
  Topic,
  TopicType,
} from '@shared/models/topic';
import { CalendarRange, DateItem, TopicItem } from './calendar.type';
import { format } from 'date-fns';

@Injectable()
export class CalendarService {
  generateDateRange = (start: Date, end: Date) => {
    const dateList = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dateList.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateList;
  };
  handleGetDateItems = (
    calendarRange: CalendarRange,
    topics: Topic[]
  ): DateItem[] => {
    const dateRange = this.generateDateRange(
      calendarRange.start,
      calendarRange.end
    );
    const dateList: DateItem[] = [];
    dateRange.forEach((date) => {
      const items = this.handleGetDateItem(date, topics);
      dateList.push(items);
    });
    return dateList;
  };

  handleGetDateItem = (date: Date, topics: Topic[]): DateItem => {
    const dateItems: DateItem = {
      date: date,
      topicItems: [],
    };
    topics.forEach((topic) => {
      if (this.canGetThisTopic(date, topic))
        dateItems.topicItems.push(this.handleGetThisTopic(topic));
    });
    return dateItems;
  };

  canGetThisTopic = (date: Date, topic: Topic) => {
    const { type } = topic;
    if (type === TopicType.MEETING)
      return this.canGetThisMeetingTopic(date, topic as MeetingTopic);
    else if (type === TopicType.ASSIGNMENT)
      return this.canGetThisAssignmentTopic(date, topic as AssignmentTopic);
    else if (type === TopicType.QUIZ)
      return this.canGetThisQuizTopic(date, topic as QuizTopic);
    return false;
  };

  handleGetThisTopic = (topic: Topic): TopicItem => {
    const { type } = topic;
    if (type === TopicType.MEETING)
      return this.handleGetThisMeetingTopic(topic as MeetingTopic);
    else if (type === TopicType.ASSIGNMENT)
      return this.handleGetThisAssignmentTopic(topic as AssignmentTopic);
    return this.handleGetThisQuizTopic(topic as QuizTopic);
  };

  canGetThisMeetingTopic = (date: Date, topic: MeetingTopic) => {
    if (!topic.data.open) return false;
    const openDate = new Date(topic.data.open);
    return isInDate(date, openDate);
  };

  handleGetThisMeetingTopic = (topic: MeetingTopic): TopicItem => {
    const openDate = topic.data.open ? new Date(topic.data.open) : null;
    return {
      startTime: openDate,
      endTime: null,
      topic: topic,
      course: topic.course,
    };
  };

  canGetThisAssignmentTopic = (date: Date, topic: AssignmentTopic) => {
    const openStr = topic.data.open;
    const closeStr = topic.data.close;
    const openDate = openStr ? new Date(openStr) : null;
    const closeDate = closeStr ? new Date(closeStr) : null;

    if (openDate && isInDate(date, openDate)) return true;
    if (closeDate && isInDate(date, closeDate)) return true;
    return false;
  };

  handleGetThisAssignmentTopic = (topic: AssignmentTopic): TopicItem => {
    const openDate = topic.data.open ? new Date(topic.data.open) : null;
    const closeDate = topic.data.close ? new Date(topic.data.close) : null;
    return {
      startTime: openDate,
      endTime: closeDate,
      topic: topic,
      course: topic.course,
    };
  };

  canGetThisQuizTopic = (date: Date, topic: QuizTopic) => {
    const openStr = topic.data.open;
    const closeStr = topic.data.close;
    const openDate = openStr ? new Date(openStr) : null;
    const closeDate = closeStr ? new Date(closeStr) : null;
    if (openDate && isInDate(date, openDate)) return true;
    if (closeDate && isInDate(date, closeDate)) return true;
    return false;
  };

  handleGetThisQuizTopic = (topic: QuizTopic): TopicItem => {
    const openDate = topic.data.open ? new Date(topic.data.open) : null;
    const closeDate = topic.data.close ? new Date(topic.data.close) : null;
    return {
      startTime: openDate,
      endTime: closeDate,
      topic: topic,
      course: topic.course,
    };
  };

  getTopicTime(data: TopicItem, date: Date): string {
    const { startTime, endTime } = data;

    const isStart = !!startTime && isInDate(date, startTime);
    const isEnd = !!endTime && isInDate(date, endTime);

    if (!startTime || !endTime) {
      const time = startTime || endTime;
      let result = time ? format(time, 'hh:mm a') : 'No time';
      if (isStart) result += ' \u25B6';
      if (isEnd) result += '   \u23F0';
      return result;
    }

    if (this.isBothStartAndFinish(data, date)) {
      let result = `${format(startTime, 'hh:mm a')} - ${format(
        endTime,
        'hh:mm a'
      )}`;
      return result;
    }

    if (this.isFlagStart(data, date)) {
      let result = startTime ? format(startTime, 'hh:mm a') : 'No time';
      if (isStart) result += '   \u25B6';
      return result;
    }

    let result = endTime ? format(endTime, 'hh:mm a') : 'No time';
    if (isEnd) result += '   \u23F0';
    return result;
  }

  isFlagStart(data: TopicItem, date: Date): boolean {
    const { startTime, endTime } = data;

    return (
      !!startTime &&
      !!endTime &&
      isInDate(date, startTime) &&
      !this.isBothStartAndFinish(data, date)
    );
  }

  isBothStartAndFinish(data: TopicItem, date: Date): boolean {
    const { startTime, endTime } = data;
    return !!startTime && !!endTime && isInDate(startTime, endTime);
  }
}
