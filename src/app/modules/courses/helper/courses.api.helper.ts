import { Course } from '@shared/models/course';
import {
  convertSectionFromResponseData,
  convertSectionToUpdateRequestData,
} from './section.api.helper';
import { Topic, TopicType } from '@shared/models/topic';
import { convertAssignmentFromResponseData } from '@modules/assignment/helper/assignment.api.helper';
import { convertQuizFromResponseData } from '@modules/quiz/helper/quiz.api.helper';
import { INewCourseFormData } from '../components/new-course/new-course-form/new-course-form.config';
import { GetRandomCourseBackground } from '@shared/helper/image.helpter';

export const convertCourseToCreateRequestData = (data: INewCourseFormData) => {
  return {
    id: data.courseId,
    title: data.title,
    description: '',
    imageUrl: GetRandomCourseBackground(),
    price: null,
    category: data.category,
    level: data.level,
    isPublished: data.visibility === '1',
  };
};

export const convertCourseToUpdateRequestData = (course: Course) => {
  return {
    id: course.id,
    title: course.title,
    price: course.price,
    category: course.category,
    level: course.level,
    isPublished: course.isPublished,
    imageUrl: course.imageUrl,
  };
};

export const convertCourseFromResponseData = (data: any): Course => {
  const sectionData = Array.isArray(data.sections) ? data.sections : [];
  const res = {
    ...data,
    sections: sectionData.map((section: any) =>
      convertSectionFromResponseData(section)
    ),
  };
  return res;
};

export const convertCourseWorkFromResponseData = (data: any): Topic[] => {
  return data.map((item: any) => {
    if (item.type === TopicType.ASSIGNMENT)
      return convertAssignmentFromResponseData(item);
    if (item.type === TopicType.QUIZ) return convertQuizFromResponseData(item);
    return item;
  });
};
