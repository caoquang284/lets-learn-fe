import { Component, Input, OnInit } from '@angular/core';
import { BarChartSegment } from '@shared/components/charts/bar-chart/bar-chart.component';
import { LineChartSegment } from '@shared/components/charts/line-chart/line-chart.component';
import { Course } from '@shared/models/course';
import { DashboardStat } from '@shared/models/dashboard-stats';
import {
  GetQuizOverallReport,
  GetAssignmentOverallReport,
} from '@shared/api/report.api';
import {
  QuizOverallReport,
  AssignmentOverallReport,
} from '@shared/models/report';
import { Rank } from '@shared/components/ranking/rank-logo/rank-logo.component';
import { UserService } from '@shared/services/user.service';
import { User } from '@shared/models/user';

@Component({
  selector: 'tab-dashboard-student',
  standalone: false,
  templateUrl: './tab-dashboard-student.component.html',
  styleUrl: './tab-dashboard-student.component.scss',
})
export class TabDashboardStudentComponent implements OnInit {
  @Input({ required: true }) course!: Course;
  generalStats: DashboardStat[] = [];
  quizStats: DashboardStat[] = [];
  assignmentsStats: DashboardStat[] = [];

  avgQuizMarkSegments: LineChartSegment[] = [];
  avgAssignmentsMarkSegments: LineChartSegment[] = [];

  topQuizMarkSegments: BarChartSegment[] = [];
  topAssignmentsMarkSegments: BarChartSegment[] = [];

  monthLabels = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date.toLocaleString('default', { month: 'short' });
  });

  quizReport: QuizOverallReport | null = null;
  assignmentReport: AssignmentOverallReport | null = null;
  currentUser: User | null = null;

  constructor(private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    this.currentUser = this.userService.getUser();
    await this.fetchReports();
    this.populateStats();
  }

  async fetchReports() {
    // Fetch for last 6 months for line chart, and current month for stats
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    // Current month for stats
    const current = months[5];
    const start = new Date(current.year, current.month, 1);
    const end = new Date(current.year, current.month + 1, 0, 23, 59, 59, 999);
    const startTime = start.toISOString();
    const endTime = end.toISOString();
    // For line charts, fetch for each month (filter for current user)
    const quizMarks: number[] = [];
    const assignmentMarks: number[] = [];
    for (const m of months) {
      const s = new Date(m.year, m.month, 1);
      const e = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999);
      try {
        const quiz = await GetQuizOverallReport(
          this.course.id,
          s.toISOString(),
          e.toISOString()
        );
        // Find this user's quiz mark for each quiz in the month
        let userQuizMarks: number[] = [];
        if (quiz?.singleQuizReports?.length) {
          for (const q of quiz.singleQuizReports) {
            const userMarkObj =
              q.studentWithMarkOver8?.find(
                (stu: any) => stu.student.id === this.currentUser?.id
              ) ||
              q.studentWithMarkOver5?.find(
                (stu: any) => stu.student.id === this.currentUser?.id
              ) ||
              q.studentWithMarkOver2?.find(
                (stu: any) => stu.student.id === this.currentUser?.id
              ) ||
              q.studentWithMarkOver0?.find(
                (stu: any) => stu.student.id === this.currentUser?.id
              );
            if (userMarkObj && typeof userMarkObj.mark === 'number') {
              userQuizMarks.push(userMarkObj.mark / 10);
            }
          }
        }
        // Average for this month (for this user)
        quizMarks.push(
          userQuizMarks.length
            ? userQuizMarks.reduce((a, b) => a + b, 0) / userQuizMarks.length
            : 0
        );
      } catch {
        quizMarks.push(0);
      }
      try {
        const assignment = await GetAssignmentOverallReport(
          this.course.id,
          s.toISOString(),
          e.toISOString()
        );
        // Find this user's assignment mark for each assignment in the month
        let userAssignmentMarks: number[] = [];
        if (assignment?.singleAssignmentReports?.length) {
          for (const a of assignment.singleAssignmentReports) {
            const userMarkObj = a.studentMarks?.find(
              (stu: any) => stu.student.id === this.currentUser?.id
            );
            if (userMarkObj && typeof userMarkObj.mark === 'number') {
              userAssignmentMarks.push(userMarkObj.mark / 10);
            }
          }
        }
        // Average for this month (for this user)
        assignmentMarks.push(
          userAssignmentMarks.length
            ? userAssignmentMarks.reduce((a, b) => a + b, 0) /
                userAssignmentMarks.length
            : 0
        );
      } catch {
        assignmentMarks.push(0);
      }
    }
    this.avgQuizMarkSegments = [
      { label: 'Quiz', data: quizMarks.map((v) => v * 100), color: '#EC4899' },
    ];
    this.avgAssignmentsMarkSegments = [
      {
        label: 'Assignments',
        data: assignmentMarks.map((v) => v * 100),
        color: '#A855F7',
      },
    ];
    // For current month stats
    try {
      this.quizReport = await GetQuizOverallReport(
        this.course.id,
        startTime,
        endTime
      );
    } catch {
      this.quizReport = null;
    }
    try {
      this.assignmentReport = await GetAssignmentOverallReport(
        this.course.id,
        startTime,
        endTime
      );
    } catch {
      this.assignmentReport = null;
    }
  }

  populateStats() {
    // General stats (for current user only)
    this.generalStats = [
      {
        label: 'Quiz completion rate',
        value: this.getUserQuizCompletionRate(),
      },
      {
        label: 'Avg quiz mark',
        value: (this.getQuizAvgMark() * 100).toFixed(1),
        rank: this.getRank(this.getQuizAvgMark()),
      },
      {
        label: 'Assignment completion rate:',
        value: this.getUserAssignmentCompletionRate(),
      },
      {
        label: 'Avg assignment mark',
        value: (this.getAssignmentAvgMark() * 100).toFixed(1),
        rank: this.getRank(this.getAssignmentAvgMark()),
      },
    ];
    // Quiz stats (for current user only)
    this.quizStats = [
      { label: 'Total quizzes', value: this.getUserQuizCount().toString() },
      { label: 'Quizzes to do', value: this.getUserQuizToDoCount().toString() },
      { label: 'Next quiz will end on', value: '-' },
    ];
    // Assignment stats (for current user only)
    this.assignmentsStats = [
      {
        label: 'Total assignments',
        value: this.getUserAssignmentCount().toString(),
      },
      {
        label: 'Assignments to do',
        value: this.getUserAssignmentToDoCount().toString(),
      },
      {
        label: 'Next assignment will end on',
        value: this.assignmentReport?.closestNextEndAssignment
          ? this.formatDate(this.assignmentReport.closestNextEndAssignment)
          : '-',
      },
    ];
    // Top quiz marks (bar chart)
    this.topQuizMarkSegments = (this.quizReport?.singleQuizReports || [])
      .map((q, idx) => {
        // Find the student's mark for this quiz
        const userMarkObj =
          q.studentWithMarkOver8?.find(
            (stu: any) => stu.student.id === this.currentUser?.id
          ) ||
          q.studentWithMarkOver5?.find(
            (stu: any) => stu.student.id === this.currentUser?.id
          ) ||
          q.studentWithMarkOver2?.find(
            (stu: any) => stu.student.id === this.currentUser?.id
          ) ||
          q.studentWithMarkOver0?.find(
            (stu: any) => stu.student.id === this.currentUser?.id
          );
        return {
          value:
            userMarkObj && typeof userMarkObj.mark === 'number'
              ? userMarkObj.mark
              : 0,
          color: '#8B5CF6',
          label: q.name || `Quiz ${idx + 1}`,
        };
      })
      .filter((q) => q.value > 0); // Only show quizzes the user has a mark for
    // Top assignment marks (bar chart)
    this.topAssignmentsMarkSegments = (
      this.assignmentReport?.singleAssignmentReports || []
    )
      .map((a, idx) => {
        // Find the student's mark for this assignment
        const userMarkObj = a.studentMarks?.find(
          (stu: any) => stu.student.id === this.currentUser?.id
        );
        return {
          value:
            userMarkObj && typeof userMarkObj.mark === 'number'
              ? userMarkObj.mark
              : 0,
          color: '#06B6D4',
          label: a.name || `Assignment ${idx + 1}`,
        };
      })
      .filter((a) => a.value > 0); // Only show assignments the user has a mark for
  }

  getQuizAvgMark(): number {
    if (!this.quizReport || !this.quizReport.singleQuizReports?.length)
      return 0;
    // Only for current user: for each quiz, find the mark for the current user
    let total = 0;
    let count = 0;
    for (const quiz of this.quizReport.singleQuizReports) {
      // Find the student's mark for this quiz
      const userMarkObj =
        quiz.studentWithMarkOver8?.find(
          (stu: any) => stu.student.id === this.currentUser?.id
        ) ||
        quiz.studentWithMarkOver5?.find(
          (stu: any) => stu.student.id === this.currentUser?.id
        ) ||
        quiz.studentWithMarkOver2?.find(
          (stu: any) => stu.student.id === this.currentUser?.id
        ) ||
        quiz.studentWithMarkOver0?.find(
          (stu: any) => stu.student.id === this.currentUser?.id
        );
      if (userMarkObj && typeof userMarkObj.mark === 'number') {
        total += userMarkObj.mark;
        count++;
      }
    }
    if (!count) return 0;
    return total / count / 10; // scale to 10-point system
  }

  getAssignmentAvgMark(): number {
    if (
      !this.assignmentReport ||
      !this.assignmentReport.singleAssignmentReports?.length
    )
      return 0;
    // Only for current user: find all assignment reports, then for each, find the mark for the current user
    let total = 0;
    let count = 0;
    for (const assignment of this.assignmentReport.singleAssignmentReports) {
      const userMarkObj = assignment.studentMarks?.find(
        (stu: any) => stu.student.id === this.currentUser?.id
      );
      if (userMarkObj && typeof userMarkObj.mark === 'number') {
        total += userMarkObj.mark;
        count++;
      }
    }
    if (!count) return 0;
    return total / count / 10; // scale to 10-point system
  }

  getUserQuizCompletionRate(): string {
    // You may need to adjust this logic based on available fields
    // For now, just show '100%' if user has any quiz, else '0%'
    const userQuizzes =
      this.quizReport?.singleQuizReports?.filter((q) =>
        q.students?.some((stu: any) => stu.id === this.currentUser?.id)
      ) || [];
    return userQuizzes.length ? '100%' : '0%';
  }

  getUserAssignmentCompletionRate(): string {
    const userAssignments =
      this.assignmentReport?.singleAssignmentReports?.filter((a) =>
        a.studentMarks?.some(
          (stu: any) => stu.student.id === this.currentUser?.id
        )
      ) || [];
    return userAssignments.length ? '100%' : '0%';
  }

  getUserQuizCount(): number {
    return (
      this.quizReport?.singleQuizReports?.filter((q) =>
        q.students?.some((stu: any) => stu.id === this.currentUser?.id)
      ).length || 0
    );
  }

  getUserQuizToDoCount(): number {
    // Placeholder: you may want to implement logic to count quizzes not yet done by user
    return 0;
  }

  getUserAssignmentCount(): number {
    return (
      this.assignmentReport?.singleAssignmentReports?.filter((a) =>
        a.studentMarks?.some(
          (stu: any) => stu.student.id === this.currentUser?.id
        )
      ).length || 0
    );
  }

  getUserAssignmentToDoCount(): number {
    // Placeholder: you may want to implement logic to count assignments not yet done by user
    return 0;
  }

  getRank(mark?: number): Rank | undefined {
    if (mark === undefined || mark === null) return undefined;
    if (mark >= 0.8) return 'S';
    if (mark >= 0.65) return 'A';
    if (mark >= 0.5) return 'B';
    return 'C';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
