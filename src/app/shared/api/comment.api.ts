import { GET, POST, DELETE } from '@shared/api/utils.api';
import { Comment } from '@shared/models/comment';

// Get all comments for a topic
export const getComments = (courseId: string, topicId: string): Promise<Comment[]> => {
  return GET(`/course/${courseId}/topic/${topicId}/comments`);
};

// Create a new comment for a topic
export const createComment = (courseId: string, topicId: string, comment: { text: string }): Promise<Comment> => {
  return POST(`/course/${courseId}/topic/${topicId}/comments`, comment);
};

// Delete a comment by id
export const deleteComment = (courseId: string, topicId: string, commentId: string): Promise<void> => {
  return DELETE(`/course/${courseId}/topic/${topicId}/comments/${commentId}`);
};
