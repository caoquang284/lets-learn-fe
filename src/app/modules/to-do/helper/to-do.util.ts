import { AssignmentTopic, QuizTopic, Topic, TopicType } from '@shared/models/topic';

const hasAttemptedQuiz = (quiz: QuizTopic) => {
  const { response } = quiz;
  return Array.isArray(response) && response.length > 0;
};

// no due date -> not submitted and no due date
const isNoDueDateAssignment = (assignment: AssignmentTopic) => {
  const { response } = assignment;
  if (response) return false;

  const { close } = assignment.data;
  return !close;
};

// done -> has due date -> has response and submitted date is earlier than due date
//      -> no due date -> has response
const isDoneAssignment = (assignment: AssignmentTopic) => {
  const { response } = assignment;
  return !!response;
};

// overdue -> has due date -> not submitted and due date is passed
const isOverdueAssignment = (assignment: AssignmentTopic) => {
  const { close } = assignment.data;
  if (!close) return false;

  const { response } = assignment;
  if (response) return false;

  return new Date() > new Date(close);
};

// working -> has open and due date -> not submitted and behind the open due date is not passed
//         -> no open and has due date -> not submitted and due date is not passed
//         -> has open and no due date -> not submitted and behind the open date
const isWorkingInProgressAssignment = (assignment: AssignmentTopic) => {
  const { response } = assignment;
  if (response) return false;
  const { close, open } = assignment.data;
  if (open && close) {
    return new Date(open) < new Date() && new Date() < new Date(close);
  } else if (!open && close) {
    return new Date() < new Date(close);
  } else if (open && !close) {
    return new Date(open) < new Date();
  }

  return true;
};

// no due date -> not submitted and no due date
const isNoDueDateQuiz = (quiz: QuizTopic) => {
  if (hasAttemptedQuiz(quiz)) return false;

  const { close } = quiz.data;
  return !close;
};

// done -> has due date -> has response and submitted date is earlier than due date
//      -> no due date -> has response
const isDoneQuiz = (quiz: QuizTopic) => {
  return hasAttemptedQuiz(quiz);
};

// overdue -> has due date -> not submitted and due date is passed
const isOverdueQuiz = (quiz: QuizTopic) => {
  const { close } = quiz.data;
  if (!close) return false;

  if (hasAttemptedQuiz(quiz)) return false;

  return new Date() > new Date(close);
};

// working -> has open and due date -> not submitted and behind the open due date is not passed
//         -> no open and has due date -> not submitted and due date is not passed
//         -> has open and no due date -> not submitted and behind the open date
const isWorkingInProgressQuiz = (quiz: QuizTopic) => {
  if (hasAttemptedQuiz(quiz)) return false;

  const { close, open } = quiz.data;
  if (open && close) {
    return new Date(open) < new Date() && new Date() < new Date(close);
  } else if (!open && close) {
    return new Date() < new Date(close);
  } else if (open && !close) {
    return new Date(open) < new Date();
  }

  return true;
};

export function isDoneTopic(topic: Topic): boolean {
  const { type } = topic;
  if (type === TopicType.QUIZ) return isDoneQuiz(topic as QuizTopic);
  if (type === TopicType.ASSIGNMENT)
    return isDoneAssignment(topic as AssignmentTopic);
  return false;
}

export function isOverdueTopic(topic: Topic): boolean {
  const { type } = topic;
  if (type === TopicType.QUIZ) return isOverdueQuiz(topic as QuizTopic);
  if (type === TopicType.ASSIGNMENT)
    return isOverdueAssignment(topic as AssignmentTopic);
  return false;
}

export function isWorkingInProgressTopic(topic: Topic): boolean {
  const { type } = topic;
  if (type === TopicType.QUIZ)
    return isWorkingInProgressQuiz(topic as QuizTopic);
  if (type === TopicType.ASSIGNMENT)
    return isWorkingInProgressAssignment(topic as AssignmentTopic);
  return false;
}

export function isNoDueDateTopic(topic: Topic): boolean {
  const { type } = topic;
  if (type === TopicType.QUIZ) return isNoDueDateQuiz(topic as QuizTopic);
  if (type === TopicType.ASSIGNMENT)
    return isNoDueDateAssignment(topic as AssignmentTopic);
  return false;
} 