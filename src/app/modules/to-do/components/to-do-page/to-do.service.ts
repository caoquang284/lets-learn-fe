import { Injectable } from '@angular/core';
import { AssignmentTopic, QuizTopic, Topic, TopicType } from '@shared/models/topic';
import { ToDoItem } from '../../constants/to-do.constants';
import { UserService } from '@shared/services/user.service';
import { GetAllAssignmentsOfUser, GetAllQuizzesOfUser } from '@modules/courses/api/topic.api';

@Injectable()
export class ToDoService {
  constructor(private userService: UserService) {}

  async getToDoItems(): Promise<ToDoItem[]> {
    const user = this.userService.getUser();
    if (!user) throw new Error('User not found');
    
    const [assignments, quizzes] = await Promise.all([
      GetAllAssignmentsOfUser(),
      GetAllQuizzesOfUser()
    ]);

    const allTopics: Topic[] = [...(assignments || []), ...(quizzes || [])];

    return allTopics.map(topic => this.convertTopicToToDoItem(topic));
  }

  private convertTopicToToDoItem(topic: Topic): ToDoItem {
    const courseTitle = topic.course?.title || 'Unknown Course';
    const courseId = topic.course?.id || '';
    const dueDate = this.getTopicDueDate(topic);
    return {
      id: topic.id,
      title: topic.title,
      course: courseTitle,
      courseId: courseId,
      type: topic.type,
      dueDate: dueDate,
      submitted: false,
      graded: false,
      icon: topic.type === TopicType.ASSIGNMENT ? 'assignment' : 'quiz',
      topic: topic,
      dueDateFormatted: this.formatDueDate(dueDate).dueDateFormatted,
      dueStatus: this.formatDueDate(dueDate).dueStatus
    };
  }

  private getTopicDueDate(topic: Topic): string | null {
    if (topic.type === TopicType.ASSIGNMENT) {
      return (topic as AssignmentTopic).data.close;
    } else if (topic.type === TopicType.QUIZ) {
      return (topic as QuizTopic).data.close;
    }
    return null;
  }

  private formatDueDate(dueDate: string | null): { dueDateFormatted: string; dueStatus: string } {
    if (!dueDate) {
      return { dueDateFormatted: '', dueStatus: '' };
    }
    const due = new Date(dueDate);
    const now = new Date();
    const timeDiff = due.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const dueDateFormatted = `Due ${due.toLocaleDateString('en-US', options)}`;
    let dueStatus = '';
    if (daysDiff < 0) {
      dueStatus = `(${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''} late)`;
    } else if (daysDiff === 0) {
      dueStatus = '(Due today)';
    } else if (daysDiff === 1) {
      dueStatus = '(1 day left)';
    } else {
      dueStatus = `(${daysDiff} days left)`;
    }
    return { dueDateFormatted, dueStatus };
  }
}
