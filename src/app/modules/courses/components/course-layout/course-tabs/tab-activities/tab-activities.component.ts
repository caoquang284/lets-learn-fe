import { Component, Input, OnInit } from '@angular/core';
import { ComboboxService } from '@shared/components/combobox/combobox.service';
import { Course, Section } from '@shared/models/course';
import { TopicType } from '@shared/models/topic';
import { User } from '@shared/models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'tab-activities',
  standalone: false,
  templateUrl: './tab-activities.component.html',
  styleUrl: './tab-activities.component.scss',
  providers: [ComboboxService],
})
export class TabActivitiesComponent implements OnInit {
  @Input({ required: true }) course!: Course;
  @Input({ required: true }) isStudent!: boolean;
  @Input({ required: true }) user!: User | null;

  // All available activity types
  activityTypes = [
    { value: TopicType.QUIZ, label: 'Quiz' },
    { value: TopicType.ASSIGNMENT, label: 'Assignment' },
    { value: TopicType.MEETING, label: 'Meeting' },
  ];

  selectedType: TopicType | 'all' = 'all';

  filteredSections: Section[] = [];

  comboboxOptions = [
    { value: 'all', label: 'All activities' },
    ...this.activityTypes,
  ];

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.filterSections();
    if (!this.course.sections || this.course.sections.length === 0) {
      this.toastr.warning('No activities found for this course.');
    }
  }

  onSelectType(option: { value: any }) {
    this.selectedType = option.value as TopicType | 'all';
    this.filterSections();
  }

  filterSections() {
    if (!this.course?.sections) {
      this.filteredSections = [];
      return;
    }
    this.filteredSections = this.course.sections
      .map((section) => ({
        ...section,
        topics: section.topics.filter((topic) =>
          this.selectedType === 'all'
            ? [
                TopicType.QUIZ,
                TopicType.ASSIGNMENT,
                TopicType.MEETING,
              ].includes(topic.type)
            : topic.type === this.selectedType
        ),
      }))
      .filter((section) => section.topics.length > 0);
  }
}
