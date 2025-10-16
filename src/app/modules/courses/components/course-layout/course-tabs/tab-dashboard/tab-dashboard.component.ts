import { Component, Input, OnInit } from '@angular/core';
import { Course } from '@shared/models/course';
import { DonutChartSegment } from '@shared/components/charts/donut-chart/donut-chart.component';
import { DashboardStat } from '@shared/models/dashboard-stats';
import { generateMonthOptions } from '@shared/helper/date.helper';
import { ComboboxService } from '@shared/components/combobox/combobox.service';
import { BarChartSegment } from '@shared/components/charts/bar-chart/bar-chart.component';
import {
  GetQuizOverallReport,
  GetAssignmentOverallReport,
} from '@shared/api/report.api';
import {
  QuizOverallReport,
  AssignmentOverallReport,
} from '@shared/models/report';

@Component({
  selector: 'tab-dashboard',
  standalone: false,
  templateUrl: './tab-dashboard.component.html',
  styleUrl: './tab-dashboard.component.scss',
  providers: [ComboboxService],
})
export class TabDashboardComponent implements OnInit {
  @Input({ required: true }) course!: Course;
  selectedTab: 'quiz' | 'assignments' = 'quiz';
  selectedMonth: number = new Date().getMonth(); // 0 = January, 11 = December
  selectedYear: number = new Date().getFullYear();
  selectedMonthValue: string = `${this.selectedYear}-${this.selectedMonth}`;

  monthOptions: { label: string; value: string }[] = [];

  assignmentsStats: DashboardStat[] = [];
  quizStats: DashboardStat[] = [];

  //assignments chart data
  fileTypeSegments: DonutChartSegment[] = [];
  gradedSegments: DonutChartSegment[] = [];
  assignmentsAvgMarkSegments: BarChartSegment[] = [];
  assignmentsCompletionRateSegments: BarChartSegment[] = [];

  //quiz chart data
  questionTypeSegments: DonutChartSegment[] = [];
  studentMarkSegments: DonutChartSegment[] = [];
  quizAvgMarkSegments: BarChartSegment[] = [];
  quizCompletionRateSegments: BarChartSegment[] = [];

  quizReport: QuizOverallReport | null = null;
  assignmentReport: AssignmentOverallReport | null = null;

  async ngOnInit(): Promise<void> {
    this.monthOptions = generateMonthOptions();
    this.selectedMonthValue = this.monthOptions[0]?.value || '';
    await this.onMonthChange(this.selectedMonthValue);
  }

  async onMonthChange(value: string): Promise<void> {
    const [year, month] = value.split('-').map(Number);
    this.selectedMonth = month;
    this.selectedYear = year;
    this.selectedMonthValue = value;
    await Promise.all([
      this.fetchQuizOverallReport(),
      this.fetchAssignmentOverallReport(),
    ]);
    this.updateStatsForMonth();
  }

  async fetchQuizOverallReport() {
    // Calculate start and end of month
    const start = new Date(this.selectedYear, this.selectedMonth, 1);
    const end = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0,
      23,
      59,
      59,
      999
    );
    const startTime = start.toISOString();
    const endTime = end.toISOString();
    try {
      this.quizReport = await GetQuizOverallReport(
        this.course.id,
        startTime,
        endTime
      );
    } catch (error) {
      this.quizReport = null;
    }
  }

  async fetchAssignmentOverallReport() {
    // Calculate start and end of month
    const start = new Date(this.selectedYear, this.selectedMonth, 1);
    const end = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0,
      23,
      59,
      59,
      999
    );
    const startTime = start.toISOString();
    const endTime = end.toISOString();
    try {
      this.assignmentReport = await GetAssignmentOverallReport(
        this.course.id,
        startTime,
        endTime
      );
    } catch (error) {
      this.assignmentReport = null;
    }
  }

  updateStatsForMonth(): void {
    // Quiz
    if (!this.quizReport) {
      this.quizStats = [];
      this.questionTypeSegments = [];
      this.studentMarkSegments = [];
      this.quizAvgMarkSegments = [];
      this.quizCompletionRateSegments = [];
    } else {
      this.quizStats = [
        { label: 'Total quizzes', value: this.quizReport.quizCount.toString() },
        {
          label: 'Number of question rang',
          value: `${this.quizReport.minQuestionCount} - ${this.quizReport.maxQuestionCount}`,
        },
        {
          label: 'Avg completion rate',
          value: `${(this.quizReport.avgCompletionPercentage > 1
            ? this.quizReport.avgCompletionPercentage * 100
            : this.quizReport.avgCompletionPercentage * 100
          ).toFixed(1)} %`,
        },
        {
          label: 'Score range',
          value: `${this.quizReport.minStudentScoreBase10.toFixed(
            1
          )} - ${this.quizReport.maxStudentScoreBase10.toFixed(1)}`,
        },
      ];
      // Question type segments
      this.questionTypeSegments = [
        {
          value: this.quizReport.multipleChoiceQuestionCount,
          color: '#EC4899',
          label: 'Multiple choice',
        },
        {
          value: this.quizReport.trueFalseQuestionCount,
          color: '#8B5CF6',
          label: 'True/false',
        },
        {
          value: this.quizReport.shortAnswerQuestionCount,
          color: '#F97316',
          label: 'Short answer',
        },
      ];
      // Mark distribution segments
      this.studentMarkSegments = [
        {
          value: this.quizReport.markDistributionCount['8'],
          color: '#4CAF50',
          label: '80 - 100%',
        },
        {
          value: this.quizReport.markDistributionCount['5'],
          color: '#448AFF',
          label: '50 - 79%',
        },
        {
          value: this.quizReport.markDistributionCount['2'],
          color: '#FFC107',
          label: '20 - 49%',
        },
        {
          value: this.quizReport.markDistributionCount['0'],
          color: '#FF5252',
          label: '0 - 19%',
        },
        {
          value: this.quizReport.markDistributionCount['-1'],
          color: '#9E9E9E',
          label: 'Not attempted',
        },
      ];
      // Avg mark segments (per quiz)
      this.quizAvgMarkSegments = this.quizReport.singleQuizReports.map(
        (q, idx) => ({
          value: q.avgStudentMarkBase10,
          color: '#06B6D4',
          label: q.name || `Quiz ${idx + 1}`,
        })
      );
      // Completion rate segments (per quiz)
      this.quizCompletionRateSegments = this.quizReport.singleQuizReports.map(
        (q, idx) => ({
          value: q.completionRate * 100,
          color: '#8B5CF6',
          label: q.name || `Quiz ${idx + 1}`,
        })
      );
    }
    // Assignments
    if (!this.assignmentReport) {
      this.assignmentsStats = [];
      this.fileTypeSegments = [];
      this.gradedSegments = [];
      this.assignmentsAvgMarkSegments = [];
      this.assignmentsCompletionRateSegments = [];
    } else {
      this.assignmentsStats = [
        {
          label: 'Total assignments',
          value: this.assignmentReport.assignmentCount?.toString() ?? '0',
        },
        {
          label: 'Avg completion rate',
          value: `${(this.assignmentReport.avgCompletionRate * 100).toFixed(
            1
          )} %`,
        },
        {
          label: 'Assignments to do',
          value:
            this.assignmentReport.assignmentsCountInProgress?.toString() ?? '0',
        },
        {
          label: 'Next assignment will end on',
          value: this.assignmentReport.closestNextEndAssignment
            ? (() => {
                const date = new Date(
                  this.assignmentReport.closestNextEndAssignment
                );
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const month = date.toLocaleString('en-US', { month: 'short' });
                const day = date.getDate();
                return `${hours}:${minutes} ${month} ${day}`;
              })()
            : '-',
        },
      ];
      // File type segments
      this.fileTypeSegments = Object.entries(
        this.assignmentReport.fileTypeCount || {}
      ).map(([type, count], idx) => ({
        value: count as number,
        color: ['#FF5252', '#E040FB', '#448AFF', '#4CAF50'][idx % 4],
        label: type,
      }));
      // Graded segments (mark distribution)
      this.gradedSegments = [
        {
          value: this.assignmentReport.markDistributionCount['8'],
          color: '#4CAF50',
          label: '80 - 100%',
        },
        {
          value: this.assignmentReport.markDistributionCount['5'],
          color: '#448AFF',
          label: '50 - 79%',
        },
        {
          value: this.assignmentReport.markDistributionCount['2'],
          color: '#FFC107',
          label: '20 - 49%',
        },
        {
          value: this.assignmentReport.markDistributionCount['0'],
          color: '#FF5252',
          label: '0 - 19%',
        },
        {
          value: this.assignmentReport.markDistributionCount['-1'],
          color: '#9E9E9E',
          label: 'Not attempted',
        },
      ];
      // Avg mark segments (per assignment)
      this.assignmentsAvgMarkSegments = (
        this.assignmentReport.singleAssignmentReports || []
      ).map((a, idx) => ({
        value: a.avgMark / 10,
        color: '#06B6D4',
        label: a.name || `Assignment ${idx + 1}`,
      }));
      // Completion rate segments (per assignment)
      this.assignmentsCompletionRateSegments = (
        this.assignmentReport.singleAssignmentReports || []
      ).map((a, idx) => ({
        value: a.completionRate * 100,
        color: '#8B5CF6',
        label: a.name || `Assignment ${idx + 1}`,
      }));
    }
  }

  get totalQuizQuestions(): number {
    if (!this.quizReport) return 0;
    return (
      (this.quizReport.multipleChoiceQuestionCount || 0) +
      (this.quizReport.trueFalseQuestionCount || 0) +
      (this.quizReport.shortAnswerQuestionCount || 0)
    );
  }

  get totalQuizStudents(): number {
    if (!this.quizReport) return 0;
    // Use unique student ids from all mark distribution arrays (excluding 'Not attempted')
    const ids = new Set<string>();
    [
      ...(this.quizReport.studentWithMarkOver8 ?? []),
      ...(this.quizReport.studentWithMarkOver5 ?? []),
      ...(this.quizReport.studentWithMarkOver2 ?? []),
      ...(this.quizReport.studentWithMarkOver0 ?? []),
    ].forEach((s) => {
      if (s.student?.id) ids.add(s.student.id);
    });
    return ids.size;
  }

  get totalGradedSubmissions(): number {
    if (!this.assignmentReport) return 0;
    // Graded = all except 'Not attempted'
    return (
      (this.assignmentReport.markDistributionCount['8'] || 0) +
      (this.assignmentReport.markDistributionCount['5'] || 0) +
      (this.assignmentReport.markDistributionCount['2'] || 0) +
      (this.assignmentReport.markDistributionCount['0'] || 0)
    );
  }

  get studentsS(): any[] {
    if (!this.quizReport) return [];
    return this.quizReport.studentWithMarkOver8.map((s) => s.student);
  }

  get studentsA(): any[] {
    if (!this.quizReport) return [];
    return this.quizReport.studentWithMarkOver5.map((s) => s.student);
  }

  get studentsB(): any[] {
    if (!this.quizReport) return [];
    return this.quizReport.studentWithMarkOver2.map((s) => s.student);
  }

  get studentsC(): any[] {
    if (!this.quizReport) return [];
    return this.quizReport.studentWithMarkOver0.map((s) => s.student);
  }
}
