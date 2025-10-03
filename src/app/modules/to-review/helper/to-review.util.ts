import { AssignmentTopic, QuizTopic, Topic, TopicType } from '@shared/models/topic';

// no due date -> do not have due date
const isNoDueDateAssignment = (assignment: AssignmentTopic): boolean => {
  const { close } = assignment.data;
  return !close;
};

// closed -> has due date -> has due date and today is after due date
const isClosedAssignment = (assignment: AssignmentTopic): boolean => {
  const { close } = assignment.data;
  if (!close) return false;
  return new Date() > new Date(close);
};

// working -> has due date -> has due date and today is before due date and after open date
const isWorkingInProgressAssignment = (assignment: AssignmentTopic): boolean => {
  const { close, open } = assignment.data;
  if (!close) return false;
  const current = new Date();
  if (open) return current < new Date(close) && current > new Date(open);
  return current < new Date(close);
};

// no due date -> do not have due date
const isNoDueDateQuiz = (quiz: QuizTopic): boolean => {
  const { close } = quiz.data;
  return !close;
};

// closed -> has due date -> has due date and today is after due date
const isClosedQuiz = (quiz: QuizTopic): boolean => {
  const { close } = quiz.data;
  if (!close) return false;
  return new Date() > new Date(close);
};

// working -> has due date -> has due date and today is before due date and after open date
const isWorkingInProgressQuiz = (quiz: QuizTopic): boolean => {
  const { close, open } = quiz.data;
  if (!close) return false;
  const current = new Date();
  if (open) return current < new Date(close) && current > new Date(open);
  return current < new Date(close);
};

export function isNoDueDateTopic(topic: Topic): boolean {
  const { type } = topic;
  if (type === TopicType.QUIZ) return isNoDueDateQuiz(topic as QuizTopic);
  else if (type === TopicType.ASSIGNMENT) return isNoDueDateAssignment(topic as AssignmentTopic);
  return false;
}

export function isClosedTopic(topic: Topic): boolean {
  const { type } = topic;
  if (type === TopicType.QUIZ) return isClosedQuiz(topic as QuizTopic);
  else if (type === TopicType.ASSIGNMENT) return isClosedAssignment(topic as AssignmentTopic);
  return false;
}

export function isWorkingInProgressTopic(topic: Topic): boolean {
  const { type } = topic;
  if (type === TopicType.QUIZ) return isWorkingInProgressQuiz(topic as QuizTopic);
  else if (type === TopicType.ASSIGNMENT)
    return isWorkingInProgressAssignment(topic as AssignmentTopic);
  return false;
} 