import { Topic } from '@shared/models/topic';

export interface ReviewItem {
  id: string;
  title: string;
  course: string;
  type: string;
  graded: number;
  submitted: number;
  assigned: number;
  icon: string;
  topic: Topic;
}

export interface ReviewItemsCategories {
  workInProgress: ReviewItem[];
  closed: ReviewItem[];
  noDueDate: ReviewItem[];
}
