import { Section } from '@shared/models/course';
import {
  convertTopicFromResponseData,
  convertTopicToRequestData,
} from './topic.api.helper';

export const convertSectionToCreateRequestData = (section: Section) => {
  return {
    position: section.position,
    title: section.title,
    description: section.description,
    courseId: section.courseId,
  };
};

export const convertSectionToUpdateRequestData = (section: Section) => {
  return {
    id: section.id,
    position: section.position,
    title: section.title,
    description: section.description,
    courseId: section.courseId,
    topics: section.topics.map((topic) => convertTopicToRequestData(topic)),
  };
};

export const convertSectionFromResponseData = (data: any): Section => {
  const topicData = Array.isArray(data.topics) ? data.topics : [];
  const res = {
    ...data,
    topics: topicData.map((topic: any) => convertTopicFromResponseData(topic)),
  };
  return res;
};
