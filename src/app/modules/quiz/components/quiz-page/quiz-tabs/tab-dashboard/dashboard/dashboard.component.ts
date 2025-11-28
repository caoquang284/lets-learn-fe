import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DonutChartSegment } from '@shared/components/charts/donut-chart/donut-chart.component';
import { DashboardStat } from '@shared/models/dashboard-stats';
import { StudentResponse } from '@shared/models/student-response';

@Component({
  selector: 'overview-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input() studentResponses: StudentResponse[] = [];
  @Input() questionCount: number = 0;

  studentCount = 0;
  stats: DashboardStat[] = [];
  questionTypeSegments: DonutChartSegment[] = [];
  studentMarkSegments: DonutChartSegment[] = [];

  ngOnInit(): void {
    this.calculateDashboardData();
    console.log('questionCount', this.questionCount);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['studentResponses'] &&
      !changes['studentResponses'].firstChange
    ) {
      this.calculateDashboardData();
    }
  }

  calculateDashboardData() {
    if (!this.studentResponses || this.studentResponses.length === 0) {
      this.initializeEmptyData();
      return;
    }

    const uniqueStudents = new Set(
      this.studentResponses.map((response) => response.studentId)
    );
    this.studentCount = uniqueStudents.size;

    const attemptedCount = this.studentResponses.length;
    const gradedResponses = this.studentResponses.filter(
      (r) => this.getMark(r) !== null
    );
    const avgMark =
      gradedResponses.length > 0
        ? (
            gradedResponses.reduce(
              (sum, r) => sum + (this.getMark(r) || 0),
              0
            ) / gradedResponses.length
          ).toFixed(1)
        : '0';
    const topMark =
      gradedResponses.length > 0
        ? Math.max(...gradedResponses.map((r) => this.getMark(r) || 0)).toFixed(1)
        : '0';
    const avgTime = this.getAverageTimeSpent();
    const completionRate =
      this.studentCount > 0
        ? Math.round((attemptedCount / this.studentCount) * 100)
        : 0;

    this.stats = [
      { label: 'Questions', value: this.questionCount.toString() },
      { label: 'Attempted', value: attemptedCount.toString() },
      { label: 'Avg mark (40)', value: avgMark },
      { label: 'Top mark (40)', value: topMark.toString() },
      { label: 'Avg time spend', value: avgTime },
      { label: 'Completion rate', value: `${completionRate}%` },
    ];

    this.calculateQuestionTypeSegments();
    this.calculateStudentMarkSegments();
  }

  private getMark(response: StudentResponse): number | null {
    if (response.data && Array.isArray((response.data as any).answers)) {
      const answers = (response.data as any).answers;
      let total = 0;
      let max = 0;
      for (const ans of answers) {
        const mark = ans.mark ?? 0;
        const maxMark = ans.maxMark ?? 1;
        total += mark;
        max += maxMark;
      }
      if (max === 0) return null;
      return (total / max) * 40; // scale to 40
    }
    return null;
  }

  private getAverageTimeSpent(): string {
    // Calculate average time spent (completedAt - startedAt) in seconds
    const times = this.studentResponses
      .map((r) => {
        const started = (r.data as any)?.startedAt
          ? new Date((r.data as any).startedAt).getTime()
          : null;
        const completed = (r.data as any)?.completedAt
          ? new Date((r.data as any).completedAt).getTime()
          : null;
        return started && completed ? (completed - started) / 1000 : null;
      })
      .filter((t) => t !== null) as number[];
    if (times.length === 0) return '0s';
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const m = Math.floor(avg / 60);
    const s = Math.round(avg % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  private calculateQuestionTypeSegments() {
    // For quiz, show question type distribution (multiple choice, true false, short answer)
    const typeCounts: { [key: string]: number } = {};
    this.studentResponses.forEach((r) => {
      const answers = (r.data as any)?.answers || [];
      answers.forEach((ans: any) => {
        const type = ans.question?.type || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });
    const colors = [
      '#E040FB',
      '#FF5252',
      '#448AFF',
      '#4CAF50',
      '#FFC107',
      '#FF9800',
    ];
    this.questionTypeSegments = Object.entries(typeCounts).map(
      ([type, count], idx) => ({
        value: count,
        color: colors[idx % colors.length],
        label: this.getTypeLabel(type),
      })
    );
  }

  private getTypeLabel(type: string): string {
    switch (type) {
      case 'multiple_choice':
      case 'choice':
        return 'Multiple choice';
      case 'true_false':
        return 'True false';
      case 'short_answer':
        return 'Short answer';
      default:
        return type;
    }
  }

  private calculateStudentMarkSegments() {
    // For quiz, show mark distribution
    const graded = this.studentResponses
      .map((r) => this.getMark(r))
      .filter((m) => m !== null) as number[];
    const ranges = [
      { min: 32, max: 40, label: '80 - 100%', color: '#4CAF50' },
      { min: 20, max: 31, label: '50 - 79%', color: '#448AFF' },
      { min: 8, max: 19, label: '20 - 49%', color: '#FFC107' },
      { min: 0, max: 7, label: '0 - 19%', color: '#FF5252' },
      { min: null, max: null, label: 'Not attempted', color: '#9E9E9E' },
    ];
    this.studentMarkSegments = ranges.map((range) => {
      if (range.min === null) {
        // Not attempted
        const notAttempted = this.studentCount - graded.length;
        return {
          value: notAttempted,
          color: range.color,
          label: range.label,
        };
      }
      const count = graded.filter(
        (m) => m >= range.min! && m <= range.max!
      ).length;
      return {
        value: count,
        color: range.color,
        label: range.label,
      };
    });
  }

  private initializeEmptyData() {
    this.studentCount = 0;
    this.stats = [
      { label: 'Questions', value: '0' },
      { label: 'Attempted', value: '0' },
      { label: 'Avg mark (40)', value: '0' },
      { label: 'Top mark', value: '0' },
      { label: 'Avg time spend', value: '0s' },
      { label: 'Completion rate', value: '0%' },
    ];
    this.questionTypeSegments = [];
    this.studentMarkSegments = [];
  }

  get studentsS() {
    return this.studentResponses
      .filter((r) => {
        const mark = this.getMark(r);
        return mark !== null && mark >= 32 && mark <= 40;
      })
      .map((r) => r.studentId);
  }

  get studentsA() {
    return this.studentResponses
      .filter((r) => {
        const mark = this.getMark(r);
        return mark !== null && mark >= 20 && mark < 32;
      })
      .map((r) => r.studentId);
  }

  get studentsB() {
    return this.studentResponses
      .filter((r) => {
        const mark = this.getMark(r);
        return mark !== null && mark >= 8 && mark < 20;
      })
      .map((r) => r.studentId);
  }

  get studentsC() {
    return this.studentResponses
      .filter((r) => {
        const mark = this.getMark(r);
        return mark !== null && mark >= 0 && mark < 8;
      })
      .map((r) => r.studentId);
  }

  get totalQuestions(): number {
    // Count unique question ids from all answers
    const questionIds = new Set<string>();
    this.studentResponses.forEach((r) => {
      const answers = (r.data as any)?.answers || [];
      answers.forEach((ans: any) => {
        if (ans.question?.id) questionIds.add(ans.question.id);
      });
    });
    return questionIds.size;
  }

  get totalStudents(): number {
    // Count unique student ids
    const studentIds = new Set<string>(this.studentResponses.map(r => r.studentId));
    return studentIds.size;
  }
}
