import { Injectable } from '@angular/core';
import {
  AssignmentTopic,
  QuizTopic,
  Topic,
  TopicType,
} from '@shared/models/topic';
import { Course } from '@shared/models/course';
import {
  ReviewItem,
  ReviewItemsCategories,
} from '../../constants/to-review.constants';
import { GetCourseWork } from '@modules/courses/api/courses.api';
import { GetTeacherCourses } from '@modules/courses/api/courses.api';
import { UserService } from '@shared/services/user.service';
import { GetAllQuizResponsesOfTopic } from '@modules/quiz/api/quiz-response.api';
import { GetAllAssignmentResponsesOfTopic } from '@modules/assignment/api/assignment-response.api';
import {
  StudentResponse,
  QuizResponseData,
  AssignmentResponseData,
} from '@shared/models/student-response';
import { isWorkingInProgressTopic, isClosedTopic, isNoDueDateTopic } from '../../helper/to-review.util';

@Injectable()
export class ToReviewService {
  constructor(private userService: UserService) {}

  async getReviewItems(courseId?: string): Promise<ReviewItem[]> {
    const user = this.userService.getUser();
    if (!user) throw new Error('User not found');

    let topics: Topic[] = [];
    if (courseId && courseId !== 'all') {
      topics = await GetCourseWork(courseId, null);
    } else {
      // All courses for teacher
      const courses: Course[] = await GetTeacherCourses(user.id);
      let allTopics: Topic[] = [];
      for (const course of courses) {
        const courseTopics = await GetCourseWork(course.id, null);
        // Attach course info to each topic
        courseTopics.forEach(topic => {
          topic.course = {
            id: course.id,
            title: course.title,
            description: course.description || '',
            imageUrl: course.imageUrl || '',
            price: course.price || 0,
            category: course.category || '',
            level: course.level || '',
            students: course.students || [],
            creator: course.creator || { id: '', username: '', email: '', password: '', avatar: '', role: undefined, courses: [] },
            sections: course.sections || [],
            isPublished: course.isPublished || false
          };
        });
        allTopics = allTopics.concat(courseTopics);
      }
      topics = allTopics;
    }

    // Filter topics and fetch responses for each topic
    const reviewableTopics = topics.filter(
      (topic) =>
        topic.type === TopicType.ASSIGNMENT || topic.type === TopicType.QUIZ
    );

    const reviewItems = await Promise.all(
      reviewableTopics.map(async (topic) => {
        let responses: StudentResponse[] = [];
        try {
          if (topic.type === TopicType.QUIZ) {
            const allResponses = await GetAllQuizResponsesOfTopic(topic.id);
            responses = allResponses;
          } else if (topic.type === TopicType.ASSIGNMENT) {
            const allResponses = await GetAllAssignmentResponsesOfTopic(topic.id);
            responses = allResponses;
          }
        } catch (error) {
          console.error(
            `Failed to fetch responses for topic ${topic.id}:`,
            error
          );
          responses = [];
        }
        return this.convertTopicToReviewItem(topic, responses);
      })
    );

    return reviewItems;
  }

  private isQuizResponse(
    data: QuizResponseData | AssignmentResponseData
  ): data is QuizResponseData {
    return 'status' in data && 'answers' in data;
  }

  private isAssignmentResponse(
    data: QuizResponseData | AssignmentResponseData
  ): data is AssignmentResponseData {
    return 'submittedAt' in data;
  }

  private convertTopicToReviewItem(
    topic: Topic,
    responses: StudentResponse[]
  ): ReviewItem {
    const courseTitle = topic.course?.title || 'Unknown Course';
    const totalStudents = topic.course?.students?.length || 0;

    // Calculate submission and grading stats from responses
    const submitted = responses.length;
    const graded = responses.filter((response) => {
      if (
        topic.type === TopicType.QUIZ &&
        this.isQuizResponse(response.data)
      ) {
        return response.data.answers.some(
          (answer) => answer.mark !== undefined && answer.mark !== null
        );
      } else if (
        topic.type === TopicType.ASSIGNMENT &&
        this.isAssignmentResponse(response.data)
      ) {
        return response.data.mark !== undefined && response.data.mark !== null;
      }
      return false;
    }).length;

    return {
      id: topic.id,
      title: topic.title,
      course: courseTitle,
      type: topic.type,
      graded,
      submitted,
      assigned: totalStudents,
      icon: topic.type === TopicType.ASSIGNMENT ? 'assignment' : 'quiz',
      topic: topic,
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

  sortItemsByDueDate(items: ReviewItem[]): ReviewItem[] {
    return items.sort((a, b) => {
      const dateA = this.getTopicDueDate(a.topic);
      const dateB = this.getTopicDueDate(b.topic);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }


  getOverallStats(items: ReviewItem[]) {
    const total = items.length;
    const workInProgress = items.filter(item => isWorkingInProgressTopic(item.topic)).length;
    const closed = items.filter(item => isClosedTopic(item.topic)).length;
    const noDueDate = items.filter(item => isNoDueDateTopic(item.topic)).length;
    const totalAssigned = items.reduce((sum, item) => sum + item.assigned, 0);
    const totalSubmitted = items.reduce((sum, item) => sum + item.submitted, 0);
    const totalGraded = items.reduce((sum, item) => sum + item.graded, 0);
    return {
      total,
      workInProgress,
      closed,
      noDueDate,
      totalAssigned,
      totalSubmitted,
      totalGraded,
      completionRate:
        totalAssigned > 0 ? (totalSubmitted / totalAssigned) * 100 : 0,
      gradingRate: totalSubmitted > 0 ? (totalGraded / totalSubmitted) * 100 : 0,
    };
  }
}
