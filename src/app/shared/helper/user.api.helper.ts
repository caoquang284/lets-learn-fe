import { convertAssignmentFromResponseData } from '@modules/assignment/helper/assignment.api.helper';
import { convertQuizFromResponseData } from '@modules/quiz/helper/quiz.api.helper';
import { Topic, TopicType } from '@shared/models/topic';

export const convertUserWorkFromResponseData = (res: any): Topic[] => {
  return res.map((item: any) => {
    if (item.type === TopicType.ASSIGNMENT) {
      return convertAssignmentFromResponseData(item);
    } else if (item.type === TopicType.QUIZ) {
      return convertQuizFromResponseData(item);
    }
    return item;
  });
};
