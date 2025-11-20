import {
  convertAssignmentFromResponseData,
  convertAssignmentToRequestData,
} from '@modules/assignment/helper/assignment.api.helper';
import {
  convertFileFromResponseData,
  convertFileToRequestData,
} from '@modules/file/helper/file.api.helper';
import {
  convertLinkFromResponseData,
  convertLinkToRequestData,
} from '@modules/link/helper/link.api.helper';
import {
  convertPageFromResponseData,
  convertPageToRequestData,
} from '@modules/page/helper/page.api.helper';
import {
  convertQuizFromResponseData,
  convertQuizToRequestData,
} from '@modules/quiz/helper/quiz.api.helper';
import { convertMeetingToRequestData } from '@modules/meeting/helper/meeting.api.helper';
import {
  AssignmentTopic,
  FileTopic,
  LinkTopic,
  PageTopic,
  QuizTopic,
  Topic,
  TopicType,
  MeetingTopic,
} from '@shared/models/topic';

export const convertTopicToRequestData = (topic: Topic) => {
  const { type } = topic;
  let reqData;
  if (type === TopicType.QUIZ) {
    reqData = convertQuizToRequestData(topic as QuizTopic);
  } else if (type === TopicType.ASSIGNMENT) {
    reqData = convertAssignmentToRequestData(topic as AssignmentTopic);
  } else if (type === TopicType.FILE) {
    reqData = convertFileToRequestData(topic as FileTopic);
  } else if (type === TopicType.LINK) {
    reqData = convertLinkToRequestData(topic as LinkTopic);
  } else if (type === TopicType.PAGE) {
    reqData = convertPageToRequestData(topic as PageTopic);
  }else if (type === TopicType.MEETING) {
    reqData = convertMeetingToRequestData(topic as MeetingTopic);
  }
  return reqData;
};

export const convertTopicFromResponseData = (topic: any): Topic | undefined => {
  const { type } = topic;
  let res;
  if (type === TopicType.QUIZ) {
    res = convertQuizFromResponseData(topic);
  } else if (type === TopicType.ASSIGNMENT) {
    res = convertAssignmentFromResponseData(topic);
  } else if (type === TopicType.FILE) {
    res = convertFileFromResponseData(topic);
  } else if (type === TopicType.LINK) {
    res = convertLinkFromResponseData(topic);
  } else if (type === TopicType.PAGE) {
    res = convertPageFromResponseData(topic);
  }
  return res;
};
