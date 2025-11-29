import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DonutChartSegment } from '@shared/components/charts/donut-chart/donut-chart.component';
import { DashboardStat } from '@shared/models/dashboard-stats';
import { StudentResponse } from '@shared/models/student-response';
import { User } from '@shared/models/user';

@Component({
  selector: 'submission-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input() studentResponses: StudentResponse[] = [];
  @Input() students: User[] = [];
  
  studentCount = 0;
  stats: DashboardStat[] = [];
  fileTypeSegments: DonutChartSegment[] = [];
  gradedAssignmentsSegments: DonutChartSegment[] = [];

  ngOnInit(): void {
    this.calculateDashboardData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentResponses'] && !changes['studentResponses'].firstChange) {
      this.calculateDashboardData();
    }
  }

  calculateDashboardData() {
    if (!this.studentResponses || this.studentResponses.length === 0) {
      this.initializeEmptyData();
      return;
    }

    const uniqueStudentIds = new Set(this.studentResponses.map(response => response.studentId));
    this.studentCount = uniqueStudentIds.size;

    const submissionsCount = this.studentResponses.length;
    
    const gradedCount = this.studentResponses.filter(response => 
      response.data && (response.data as any).mark !== undefined && (response.data as any).mark !== null
    ).length;

    const totalFiles = this.studentResponses.reduce((total, response) => {
      const files = (response.data as any)?.files || [];
      return total + files.length;
    }, 0);

    const gradedResponses = this.studentResponses.filter(response => 
      response.data && (response.data as any).mark !== undefined && (response.data as any).mark !== null
    );
    const averageMark = gradedResponses.length > 0 
      ? (gradedResponses.reduce((sum, response) => sum + ((response.data as any).mark || 0), 0) / gradedResponses.length).toFixed(1)
      : '0';

    const topMark = gradedResponses.length > 0 
      ? Math.max(...gradedResponses.map(response => (response.data as any).mark || 0))
      : 0;

    const completionRate = this.studentCount > 0 ? Math.round((submissionsCount / this.studentCount) * 100) : 0;

    this.stats = [
      { label: 'Submissions', value: submissionsCount.toString() },
      { label: 'Graded submission', value: gradedCount.toString() },
      { label: 'Total files', value: totalFiles.toString() },
      { label: 'Avg mark (100)', value: averageMark },
      { label: 'Top mark (100)', value: topMark.toString() },
      { label: 'Completion rate', value: `${completionRate}%` },
    ];

    this.calculateFileTypeSegments();
    
    this.calculateGradedAssignmentsSegments();
  }

  private calculateFileTypeSegments() {
    const fileTypeCounts: { [key: string]: number } = {};
    
    this.studentResponses.forEach(response => {
      const files = (response.data as any)?.files || [];
      files.forEach((file: any) => {
        const fileType = this.getFileExtension(file.name || file.filename || '');
        fileTypeCounts[fileType] = (fileTypeCounts[fileType] || 0) + 1;
      });
    });

    const colors = ['#FF5252', '#E040FB', '#448AFF', '#4CAF50', '#FFC107', '#FF9800'];
    this.fileTypeSegments = Object.entries(fileTypeCounts).map(([type, count], index) => ({
      value: count,
      color: colors[index % colors.length],
      label: type
    }));
  }

  private calculateGradedAssignmentsSegments() {
    const gradedResponses = this.studentResponses.filter(response => 
      response.data && (response.data as any).mark !== undefined && (response.data as any).mark !== null
    );

    const ranges = [
      { min: 80, max: 100, label: '80 - 100 points', color: '#4CAF50' },
      { min: 50, max: 79, label: '50 - 79 points', color: '#448AFF' },
      { min: 20, max: 49, label: '20 - 49 points', color: '#FFC107' },
      { min: 0, max: 19, label: '0 - 19 points', color: '#FF5252' }
    ];

    this.gradedAssignmentsSegments = ranges.map(range => {
      const count = gradedResponses.filter(response => {
        const mark = (response.data as any).mark;
        return mark >= range.min && mark <= range.max;
      }).length;

      return {
        value: count,
        color: range.color,
        label: range.label
      };
    });
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'unknown';
  }

  private initializeEmptyData() {
    this.studentCount = 0;
    this.stats = [
      { label: 'Submissions', value: '0' },
      { label: 'Graded submission', value: '0' },
      { label: 'Total files', value: '0' },
      { label: 'Avg mark (100)', value: '0' },
      { label: 'Top mark (100)', value: '0' },
      { label: 'Completion rate', value: '0%' },
    ];
    this.fileTypeSegments = [];
    this.gradedAssignmentsSegments = [];
  }

  getTotalFiles(): number {
    if (!this.studentResponses || this.studentResponses.length === 0) {
      return 0;
    }
    return this.studentResponses.reduce((total, response) => {
      const files = (response.data as any)?.files || [];
      return total + files.length;
    }, 0);
  }

  getGradedCount(): number {
    if (!this.studentResponses || this.studentResponses.length === 0) {
      return 0;
    }
    return this.studentResponses.filter(response => 
      response.data && (response.data as any).mark !== undefined && (response.data as any).mark !== null
    ).length;
  }

  get studentsS(): User[] {
    const studentIds = this.studentResponses
      .filter(r => {
        const mark = (r.data as any)?.mark;
        return mark !== undefined && mark !== null && mark >= 80 && mark <= 100;
      })
      .map(r => r.studentId);
    return this.students.filter(s => studentIds.includes(s.id));
  }

  get studentsA(): User[] {
    const studentIds = this.studentResponses
      .filter(r => {
        const mark = (r.data as any)?.mark;
        return mark !== undefined && mark !== null && mark >= 50 && mark < 80;
      })
      .map(r => r.studentId);
    return this.students.filter(s => studentIds.includes(s.id));
  }

  get studentsB(): User[] {
    const studentIds = this.studentResponses
      .filter(r => {
        const mark = (r.data as any)?.mark;
        return mark !== undefined && mark !== null && mark >= 20 && mark < 50;
      })
      .map(r => r.studentId);
    return this.students.filter(s => studentIds.includes(s.id));
  }

  get studentsC(): User[] {
    const studentIds = this.studentResponses
      .filter(r => {
        const mark = (r.data as any)?.mark;
        return mark !== undefined && mark !== null && mark >= 0 && mark < 20;
      })
      .map(r => r.studentId);
    return this.students.filter(s => studentIds.includes(s.id));
  }

  constructor() {}
}
