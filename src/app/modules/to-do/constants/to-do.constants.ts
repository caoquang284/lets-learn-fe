import { Topic } from '@shared/models/topic';

export interface ToDoItem {
  id: string;
  title: string;
  course: string;
  courseId: string;
  type: string;
  dueDate: string | null;
  submitted: boolean;
  graded: boolean;
  icon: string;
  topic: Topic;
  dueDateFormatted?: string;
  dueStatus?: string;
}

export interface ToDoItemsCategories {
  assigned: ToDoItem[];
  overdue: ToDoItem[];
  done: ToDoItem[];
}

export interface ToDoItemsByDueDate {
  noDueDate: ToDoItem[];
  thisWeek: ToDoItem[];
  nextWeek: ToDoItem[];
  later: ToDoItem[];
}

export interface DoneItemsByCompletion {
  noDueDate: ToDoItem[];
  completeEarly: ToDoItem[];
  thisWeek: ToDoItem[];
  lastWeek: ToDoItem[];
  sooner: ToDoItem[];
}

export interface OverdueItemsByTime {
  thisWeek: ToDoItem[];
  lastWeek: ToDoItem[];
  sooner: ToDoItem[];
}