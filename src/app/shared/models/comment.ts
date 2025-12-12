
export type CommentUser = {
  id: string;
  username: string;
  avatar: string;
};

export type Comment = {
  id: string;
  text: string;
  user: CommentUser;
  topicId: string;    
  createdAt: string;
};
